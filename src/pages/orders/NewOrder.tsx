import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, GripVertical, Plus, ScanLine, Trash2, Upload } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type DraftItem = {
  key: string;
  raw_name: string;
  quantity: number;
  unit: string | null;
  source: "ocr" | "suggested" | "manual";
  confidence: number | null;
};

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const sharedInputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground/35 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/* -------------------------------------------------------------------------- */
/*  Helper: generate a short unique key                                       */
/* -------------------------------------------------------------------------- */

let _keyCounter = 0;
function nextKey(): string {
  return `item-${Date.now()}-${++_keyCounter}`;
}

/* -------------------------------------------------------------------------- */
/*  NewOrder Page                                                             */
/* -------------------------------------------------------------------------- */

export default function NewOrderPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  /* ---- state ---- */
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  /* ---- helpers ---- */
  const orgId = profile?.organization_id;

  const resetUpload = () => {
    setFileError(null);
    setExtractMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  /* ---- file validation ---- */
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Unsupported file type. Use JPEG, PNG, WebP, HEIC, or PDF.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 10 MB.";
    }
    if (file.size === 0) {
      return "File is empty.";
    }
    return null;
  };

  /* ---- upload + OCR ---- */
  const handleFile = async (file: File) => {
    resetUpload();
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      return;
    }

    if (!orgId) {
      setFileError("Your account is not linked to an organization. Contact your admin.");
      return;
    }

    setUploading(true);
    setExtractMessage("Uploading…");

    // Upload to storage: {orgId}/{timestamp}-{filename}
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${orgId}/${Date.now()}-${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from("order-uploads")
      .upload(storagePath, file, { upsert: false });

    if (uploadErr) {
      setUploading(false);
      setFileError(uploadErr.message);
      return;
    }

    setUploading(false);
    setExtractMessage("Extracting line items with AI…");
    setExtracting(true);

    // Call the Edge Function
    const { data: fnData, error: fnErr } = await supabase.functions.invoke("ocr-extract", {
      body: { filePath: storagePath },
    });

    setExtracting(false);
    setExtractMessage(null);

    if (fnErr) {
      setFileError(fnErr.message || "OCR extraction failed. Try again with a clearer image.");
      return;
    }

    const extractedItems: DraftItem[] = ((fnData as { items?: DraftItem[] })?.items || []).map((i) => ({
      ...i,
      key: nextKey(),
      source: "ocr" as const,
      quantity: i.quantity || 0,
      unit: i.unit || null,
      confidence: i.confidence ?? null,
    }));

    if (extractedItems.length === 0) {
      setExtractMessage("No products could be read from this image. You can add them manually below.");
      return;
    }

    // Apply suggested quantities from history
    const enriched = await enrichWithSuggestions(extractedItems, orgId);
    setItems(enriched);

    if (enriched.some((i) => i.confidence !== null && i.confidence < 0.6)) {
      setExtractMessage("Some items had low confidence — please double-check them.");
    } else {
      setExtractMessage("Items extracted! Review and adjust before submitting.");
    }
  };

  /* ---- quantity suggestions from last approved order history ---- */
  const enrichWithSuggestions = async (draftItems: DraftItem[], organizationId: string): Promise<DraftItem[]> => {
    // Fetch last approved order's items
    const { data: lastApprovedOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let lastItems: { product_id: string | null; raw_name: string; quantity: number }[] = [];
    if (lastApprovedOrder) {
      const { data: li } = await supabase
        .from("order_items")
        .select("product_id, raw_name, quantity")
        .eq("order_id", lastApprovedOrder.id);
      lastItems = (li as typeof lastItems) || [];
    }

    const lastQtyByName = new Map<string, number>();
    for (const li of lastItems) {
      const name = li.raw_name?.toLowerCase().trim();
      if (name) lastQtyByName.set(name, li.quantity);
    }

    return draftItems.map((item) => {
      const nameLower = item.raw_name.toLowerCase().trim();
      const suggestedQty = lastQtyByName.get(nameLower);
      if (suggestedQty && suggestedQty !== item.quantity) {
        return { ...item, quantity: suggestedQty, source: "suggested" as const };
      }
      return item;
    });
  };

  /* ---- item mutators ---- */
  const updateItem = (key: string, patch: Partial<DraftItem>) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key
          ? { ...i, ...patch, source: patch.source ?? i.source === "manual" ? "manual" : "manual" }
          : i
      )
    );
  };

  const removeItem = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));

  const addManualItem = () => {
    setItems((prev) => [
      ...prev,
      { key: nextKey(), raw_name: "", quantity: 0, unit: null, source: "manual", confidence: null },
    ]);
  };

  /* ---- drag & drop reorder ---- */
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setItems((prev) => {
      const next = [...prev];
      const [removed] = next.splice(draggedIdx, 1);
      next.splice(idx, 0, removed);
      return next;
    });
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  /* ---- submit ---- */
  const handleSubmit = async () => {
    if (!orgId) return;
    setSubmitError(null);
    setSubmitting(true);

    // Validate
    const validItems = items.filter((i) => i.raw_name.trim().length > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      setSubmitError("Add at least one item with a name and quantity before submitting.");
      setSubmitting(false);
      return;
    }

    // Find the distributor for this org
    const { data: org } = await supabase
      .from("organizations")
      .select("distributor_id")
      .eq("id", orgId)
      .maybeSingle();

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        organization_id: orgId,
        distributor_id: (org as { distributor_id: string | null } | null)?.distributor_id ?? null,
        status: "pending_approval",
        created_by: profile!.id,
      })
      .select()
      .single();

    if (orderErr || !order) {
      setSubmitError(orderErr?.message || "Could not create order.");
      setSubmitting(false);
      return;
    }

    // Insert items
    const { error: itemsErr } = await supabase.from("order_items").insert(
      validItems.map((i) => ({
        order_id: (order as { id: string }).id,
        raw_name: i.raw_name.trim(),
        quantity: i.quantity,
        unit: i.unit || null,
        source: i.source,
        confidence: i.confidence,
      }))
    );

    setSubmitting(false);

    if (itemsErr) {
      setSubmitError(itemsErr.message);
      return;
    }

    navigate("/orders", { replace: true });
  };

  /* ---- derived ---- */
  const canSubmit = items.some((i) => i.raw_name.trim().length > 0 && i.quantity > 0);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">New Order</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Upload a photo of a paper order sheet or build your order manually.
      </p>

      {/* Upload section */}
      <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <p className="font-heading text-base font-semibold text-foreground">
              Upload an order sheet
            </p>
            <p className="text-xs text-foreground/50">
              JPEG, PNG, WebP, HEIC, or PDF — max 10 MB
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || extracting}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose File
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading || extracting}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              Take Photo
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />

        {/* Upload progress */}
        {(uploading || extracting) && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-sm text-foreground/70">
            <ScanLine className="h-4 w-4 animate-pulse" aria-hidden="true" />
            {extractMessage}
          </div>
        )}

        {fileError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {fileError}
            <button
              type="button"
              onClick={resetUpload}
              className="ml-3 cursor-pointer font-medium underline underline-offset-2 hover:text-destructive/80"
            >
              Dismiss
            </button>
          </div>
        )}

        {extractMessage && !uploading && !extracting && !fileError && (
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
            {extractMessage}
          </div>
        )}
      </div>

      {/* Draft items table */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">Order Items</h2>
          <button
            type="button"
            onClick={addManualItem}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground/70 transition-all duration-150 hover:bg-muted active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Row
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
            <ScanLine className="mx-auto h-8 w-8 text-foreground/25" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-foreground/70">No items yet</p>
            <p className="mt-1 text-xs text-foreground/50">
              Upload an order sheet or add items manually to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className="w-8 px-2 py-3" />
                  <th className="px-3 py-3 font-semibold text-foreground">Product Name</th>
                  <th className="px-3 py-3 font-semibold text-foreground text-right">Quantity</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Unit</th>
                  <th className="px-3 py-3 font-semibold text-foreground">Source</th>
                  <th className="w-8 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lowConf = item.source === "ocr" && item.confidence !== null && item.confidence < 0.6;
                  return (
                    <tr
                      key={item.key}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`border-b border-border last:border-0 transition-colors duration-100 hover:bg-muted/40 ${
                        lowConf ? "bg-accent/5" : ""
                      } ${draggedIdx === idx ? "opacity-50" : ""}`}
                    >
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          className="cursor-grab pt-0.5 text-foreground/30 hover:text-foreground/60"
                          aria-label="Drag to reorder"
                        >
                          <GripVertical className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.raw_name}
                          onChange={(e) => updateItem(item.key, { raw_name: e.target.value })}
                          placeholder="Product name"
                          className={sharedInputClass}
                          aria-label="Product name"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.key, { quantity: Math.max(0, Number(e.target.value) || 0) })
                          }
                          placeholder="0"
                          className={`${sharedInputClass} text-right tabular-nums`}
                          aria-label="Quantity"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.unit || ""}
                          onChange={(e) => updateItem(item.key, { unit: e.target.value || null })}
                          placeholder="pcs"
                          className={sharedInputClass}
                          aria-label="Unit"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            item.source === "ocr"
                              ? lowConf
                                ? "bg-accent/15 text-accent"
                                : "bg-primary/10 text-primary"
                              : item.source === "suggested"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-muted text-foreground/60"
                          }`}
                        >
                          {item.source === "ocr" ? "OCR" : item.source === "suggested" ? "Suggested" : "Manual"}
                          {lowConf && (
                            <span className="ml-0.5" title="Low confidence — please verify">
                              ⚠
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="cursor-pointer rounded-md p-1.5 text-foreground/50 transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${item.raw_name || "item"}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {submitError}
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}