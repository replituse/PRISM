import { format } from "date-fns";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import type { ChalanWithItems } from "@shared/schema";

interface ChalanInvoiceProps {
  chalan: ChalanWithItems;
  onClose?: () => void;
  showActions?: boolean;
}

export function ChalanInvoice({ chalan, onClose, showActions = true }: ChalanInvoiceProps) {
  const { company } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full">
      {showActions && (
        <div className="flex items-center justify-end gap-2 p-4 border-b print:hidden">
          <Button variant="outline" onClick={onClose} data-testid="button-close-invoice">
            Close
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} data-testid="button-download-pdf">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} data-testid="button-print-invoice">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6 print:p-0">
        <div className="max-w-4xl mx-auto bg-white dark:bg-card p-8 print:p-6 print:max-w-none">
          <div className="border border-foreground/20 p-6 print:border-black">
            <div className="text-center border-b-2 border-foreground/30 pb-6 mb-6">
              <h1 className="text-3xl font-bold tracking-wide text-foreground">
                {company?.name || "PRISM Studios"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Post Production Management System
              </p>
              <div className="mt-4 inline-block px-6 py-2 bg-primary text-primary-foreground font-semibold tracking-widest text-lg">
                CHALAN / DELIVERY NOTE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bill To</p>
                  <p className="text-lg font-semibold mt-1">{chalan.customer?.name}</p>
                  {chalan.customer?.email && (
                    <p className="text-sm text-muted-foreground">{chalan.customer.email}</p>
                  )}
                  {chalan.customer?.phone && (
                    <p className="text-sm text-muted-foreground">{chalan.customer.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project</p>
                  <p className="font-medium mt-1">{chalan.project?.name}</p>
                </div>
              </div>

              <div className="space-y-4 text-right">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chalan Number</p>
                  <p className="text-xl font-mono font-bold mt-1 text-primary">{chalan.chalanNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</p>
                  <p className="font-medium mt-1">{format(new Date(chalan.chalanDate), "PPP")}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
                  <div className="mt-1">
                    {chalan.isCancelled ? (
                      <Badge variant="destructive" className="text-sm">CANCELLED</Badge>
                    ) : (
                      <Badge variant="default" className="text-sm">ACTIVE</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 border border-foreground/20 font-semibold">S.No</th>
                    <th className="text-left p-3 border border-foreground/20 font-semibold">Description</th>
                    <th className="text-center p-3 border border-foreground/20 font-semibold w-24">Quantity</th>
                    <th className="text-right p-3 border border-foreground/20 font-semibold w-32">Rate (Rs.)</th>
                    <th className="text-right p-3 border border-foreground/20 font-semibold w-32">Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {chalan.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="p-3 border border-foreground/20 text-center font-mono">{index + 1}</td>
                      <td className="p-3 border border-foreground/20">{item.description}</td>
                      <td className="p-3 border border-foreground/20 text-center font-mono">{item.quantity}</td>
                      <td className="p-3 border border-foreground/20 text-right font-mono">{(item.rate || 0).toLocaleString()}</td>
                      <td className="p-3 border border-foreground/20 text-right font-mono">{(item.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-bold">
                    <td colSpan={4} className="p-3 border border-foreground/20 text-right text-lg">Grand Total</td>
                    <td className="p-3 border border-foreground/20 text-right font-mono text-lg">
                      Rs. {(chalan.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {chalan.notes && (
              <div className="mb-6 p-4 bg-muted/50 rounded-md">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes / Remarks</p>
                <p className="text-sm">{chalan.notes}</p>
              </div>
            )}

            {chalan.isCancelled && chalan.cancelReason && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-md">
                <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-1">Cancellation Reason</p>
                <p className="text-sm">{chalan.cancelReason}</p>
              </div>
            )}

            <Separator className="my-8" />

            <div className="grid grid-cols-5 gap-4 pt-4">
              {["Prepared By", "Checked By", "Approved By", "Received By", "Authority"].map(
                (label) => (
                  <div key={label} className="text-center">
                    <div className="h-16" />
                    <div className="border-t-2 border-foreground/50 pt-2" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                  </div>
                )
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-foreground/20 text-center text-xs text-muted-foreground">
              <p>This is a computer-generated document. No signature is required.</p>
              <p className="mt-1">Generated by PRISM Post Production Management System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
