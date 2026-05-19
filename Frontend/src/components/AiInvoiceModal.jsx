import React, { useState, useEffect } from 'react';
import { aiInvoiceModalStyles } from '../assets/dummyStyles';
import AnimatedButton from '../assets/generateBtn/Gbtn';
import { RiRobot3Line } from "react-icons/ri";

const AiInvoiceModal = ({ open, onClose, onGenerate, initialText = "" }) => {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset the modal state whenever it is opened or the initial text changes
  useEffect(() => {
    setText(initialText);
    setError("");
    setLoading(false);
  }, [open, initialText]);

  if (!open) return null;

  /**
   * Handles the AI generation request when the user clicks "Generate"
   */
  const handleGenerateClick = async () => {
    setError("");
    const raw = text?.trim() || "";

    // Validate that the user has provided a prompt
    if (!raw) {
      setError("Please paste the invoice text to generate from AI");
      return;
    }

    try {
      setLoading(true);
      // Trigger the onGenerate callback passed from the parent (Invoices.jsx)
      const maybePromise = onGenerate(raw);

      // Check if the result is a promise and wait for completion
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise;
      }
    } catch (err) {
      console.error("onGenerate handler failed", err);
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      setError(msg || "Failed to generate, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={aiInvoiceModalStyles.overlay}>
      <div className={aiInvoiceModalStyles.backdrop} onClick={onClose} />

      <div className={aiInvoiceModalStyles.modal}>
        {/* Header section with Gemini branding*/}
        <div className="flex items-start justify-between">
          <div>
            <h3 className={aiInvoiceModalStyles.title}>
              <RiRobot3Line className="w-6 h-6 flex-none group-hover:scale-110 transition-transform" />
              <span>Create invoice with AI</span>
            </h3>
            <p className={aiInvoiceModalStyles.description}>
              Paste any text that contains invoice details (client name, items,
              quantity, prices) and we will attempt to extract an invoice.
            </p>
          </div>

          {/* Close "X" Button*/}
          <button onClick={onClose} className={aiInvoiceModalStyles.closeButton}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Input Area */}
        <div className="mt-4">
          <label className={aiInvoiceModalStyles.label}>Paste invoice text here</label>
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={aiInvoiceModalStyles.textarea}
            placeholder={`Example: A person wants a logo design for the brand "XYZ". Quoted for $140 for 2 logo options.`}
          />
        </div>

        {/* Error message display */}
        {error && (
          <div className={aiInvoiceModalStyles.error} role="alert">
            {String(error)
              .split("\n")
              .map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            {(/quota|exhausted|resource_exhausted/i.test(String(error)) && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#374151" }}>
                Tip: AI is temporarily unavailable (quota). Try again in a few
                minutes, or create the invoice manually.
              </div>
            )) ||
              null}
          </div>
        )}

        {/* Footer actions with animated generation button [8] */}
        <div className={aiInvoiceModalStyles.actions}>
          <AnimatedButton
            onClick={handleGenerateClick}
            isLoading={loading}
            disabled={loading}
            label="Generate"
          />
        </div>
      </div>
    </div>
  );
};

export default AiInvoiceModal;