import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { businessProfileStyles } from "../assets/dummyStyles";
import { iconColors, customStyles } from "../assets/dummyStyles";
import { FiImage, FiPenTool, FiSave, FiTrash2, FiUpload } from "react-icons/fi";
import { TbBuildings, TbRefresh } from "react-icons/tb";

const API_BASE = "http://localhost:3000";

function resolveImageUrl(url) {
  if (!url) return null;
  const s = String(url).trim();

  // keep blob/object URLs and data URIs as-is
  if (s.startsWith("blob:") || s.startsWith("data:")) return s;

  // absolute http(s) -> if localhost/127.0.0.1, rewrite to API_BASE
  if (/^https?:\/\//i.test(s)) {
    try {
      const parsed = new URL(s);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        const path =
          parsed.pathname + (parsed.search || "") + (parsed.hash || "");
        return `${API_BASE.replace(/\/+$/, "")}${path}`;
      }
      return parsed.href;
    } catch (e) {
      // fall through to relative handling
    }
  }

  // relative path like "/uploads/..." or "uploads/..." -> prefix with API_BASE
  return `${API_BASE.replace(/\/+$/, "")}/${s.replace(/^\/+/, "")}`;
}

const BusinessProfile = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  const [meta, setMeta] = useState({});
  const [saving, setSaving] = useState(false);
  // const [profileId, setProfileId] = useState(null);
  const [files, setFiles] = useState({
    logo: null,
    stamp: null,
    signature: null,
  });
  const [previews, setPreviews] = useState({
    logo: null,
    stamp: null,
    signature: null,
  });

  // Obtain Clerk token from local storage or force refresh
  const obtainToken = async () => {
    if (typeof getToken !== "function") return null;
    try {
      let t = await getToken({ template: "default" }).catch(() => null);
      if (!t) {
        // Force refresh if no token obtained
        t = await getToken({ forceRefresh: true }).catch(() => null);
      }
      return t;
    } catch (err) {
      return null;
    }
  };

  // Fetch existing profile on component mount
  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!isSignedIn) return;
      const token = await obtainToken();
      if (!token) {
        console.warn("No auth token available — cannot fetch BusinessProfile");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/business-profile/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          if (res.status !== 204 && res.status !== 401)
            console.error("Failed to fetch business profile:", res.status);
          return;
        }

        const json = await res.json().catch(() => null);
        const data = json?.data;
        if (!data || !mounted) return;

        const serverMeta = {
          businessName: data.businessName ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          gst: data.gst ?? "",
          logoUrl: data.logoUrl ?? null,
          stampUrl: data.stampUrl ?? null,
          signatureUrl: data.signatureUrl ?? null,
          signatureOwnerName: data.signatureOwnerName ?? "",
          signatureOwnerTitle: data.signatureOwnerTitle ?? "",
          defaultTaxPercent: data.defaultTaxPercent ?? 18,
          notes: data.notes ?? "",
          profileId: data._id ?? data.id ?? null,
        };

        setMeta(serverMeta);
        setPreviews((p) => ({
          ...p,
          logo: resolveImageUrl(serverMeta.logoUrl),
          stamp: resolveImageUrl(serverMeta.stampUrl),
          signature: resolveImageUrl(serverMeta.signatureUrl),
        }));
      } catch (err) {
        console.error("Error fetching business profile:", err);
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
      // revoke any object URLs created locally
      Object.values(previews).forEach((u) => {
        if (u && typeof u === "string" && u.startsWith("blob:")) {
          URL.revokeObjectURL(u);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, getToken]);

  // Update text metadata fields
  const updateMeta = (field, value) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
  };

  // Image handling for Logo, Stamp, and Signature
  function handleLocalFilePick(kind, file) {
    if (!file) return;
    // revoke previous object URL if we created it
    const prev = previews[kind];
    if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
      URL.revokeObjectURL(prev);
    }

    const objUrl = URL.createObjectURL(file);
    setFiles((f) => ({ ...f, [kind]: file }));
    setPreviews((p) => ({ ...p, [kind]: objUrl }));
    updateMeta(
      kind === "logo"
        ? "logoUrl"
        : kind === "stamp"
        ? "stampUrl"
        : "signatureUrl",
      objUrl
    );
  }

  function removeLocalFile(kind) {
    const prev = previews[kind];
    if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
      URL.revokeObjectURL(prev);
    }
    setFiles((f) => ({ ...f, [kind]: null }));
    setPreviews((p) => ({ ...p, [kind]: null }));
    updateMeta(
      kind === "logo"
        ? "logoUrl"
        : kind === "stamp"
        ? "stampUrl"
        : "signatureUrl",
      null
    );
  }

  // Save profile to database using Multipart Form Data
  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);

    try {
      const token = await obtainToken();
      if (!token) {
        alert("You must be signed in to save your business profile.");
        return;
      }

      const fd = new FormData();
      fd.append("businessName", meta.businessName || "");
      fd.append("email", meta.email || "");
      fd.append("address", meta.address || "");
      fd.append("phone", meta.phone || "");
      fd.append("gst", meta.gst || "");
      fd.append("defaultTaxPercent", String(meta.defaultTaxPercent ?? 18));
      fd.append("signatureOwnerName", meta.signatureOwnerName || "");
      fd.append("signatureOwnerTitle", meta.signatureOwnerTitle || "");
      fd.append("notes", meta.notes || "");

      // File fields for multer
      if (files.logo) fd.append("logo", files.logo);
      else if (meta.logoUrl) fd.append("logoUrl", meta.logoUrl);

      if (files.stamp) fd.append("stamp", files.stamp);
      else if (meta.stampUrl) fd.append("stampUrl", meta.stampUrl);

      if (files.signature) fd.append("signature", files.signature);
      else if (meta.signatureUrl) fd.append("signatureUrl", meta.signatureUrl);

      const profileId = meta.profileId;
      const url = profileId
        ? `${API_BASE}/api/business-profile/${profileId}` //Edit rout
        : `${API_BASE}/api/business-profile`; //Create rout
      const method = profileId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || `Save failed (${res.status})`;
        throw new Error(msg);
      }

      const saved = json?.data || json;
      const merged = {
        ...meta,
        businessName: saved.businessName ?? meta.businessName,
        email: saved.email ?? meta.email,
        address: saved.address ?? meta.address,
        phone: saved.phone ?? meta.phone,
        gst: saved.gst ?? meta.gst,
        logoUrl: saved.logoUrl ?? meta.logoUrl,
        stampUrl: saved.stampUrl ?? meta.stampUrl,
        signatureUrl: saved.signatureUrl ?? meta.signatureUrl,
        signatureOwnerName: saved.signatureOwnerName ?? meta.signatureOwnerName,
        signatureOwnerTitle:
          saved.signatureOwnerTitle ?? meta.signatureOwnerTitle,
        defaultTaxPercent: saved.defaultTaxPercent ?? meta.defaultTaxPercent,
        notes: saved.notes ?? meta.notes,
        profileId: saved._id ?? meta.profileId ?? saved.id ?? meta.profileId,
      };

      setMeta(merged);  // Saved in the DB

      if (saved.logoUrl)
        setPreviews((p) => ({ ...p, logo: resolveImageUrl(saved.logoUrl) }));
      if (saved.stampUrl)
        setPreviews((p) => ({ ...p, stamp: resolveImageUrl(saved.stampUrl) }));
      if (saved.signatureUrl)
        setPreviews((p) => ({
          ...p,
          signature: resolveImageUrl(saved.signatureUrl),
        }));

      alert(`Profile ${profileId ? "updated" : "created"} successfully.`);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert(err?.message || "Failed to save profile. See console for details.");
    } finally {
      setSaving(false);
    }
  }

  function handleClearProfile() {
    if (
      !confirm(
        "Clear current profile data? This will remove local changes and previews."
      )
    )
      return;
    // revoke any object URLs created locally
    Object.values(previews).forEach((u) => {
      if (u && typeof u === "string" && u.startsWith("blob:")) {
        URL.revokeObjectURL(u);
      }
    });
    setMeta({});
    setFiles({ logo: null, stamp: null, signature: null });
    setPreviews({ logo: null, stamp: null, signature: null });
  }


  return (
    <div className={businessProfileStyles.pageContainer}>
      <header className={businessProfileStyles.headerContainer}>
        <h1 className={businessProfileStyles.headerTitle}>Business Profile</h1>
        <p className={businessProfileStyles.headerSubtitle}>
          Configure your company details, branding assets and invoice defaults.
        </p>

        {!isSignedIn && (
          <div
            style={{
              marginTop: "12px",
              color: "#721c24",
              background: "#f8d7da",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            You are not signed in. Changes cannot be saved.
          </div>
        )}
      </header>

      <form
        onSubmit={handleSave}
        className={businessProfileStyles.pageContainer}
      >
        {/* Section 1: Business Information */}
        <div className={businessProfileStyles.cardContainer}>
          <div className={businessProfileStyles.cardHeaderContainer}>
            <div
              className={`${businessProfileStyles.cardIconContainer} ${iconColors.business}`}
            >
              <TbBuildings className="w-5 h-5" />
            </div>
            <h2 className={businessProfileStyles.cardTitle}>
              Business Information
            </h2>
          </div>

          <div className={businessProfileStyles.gridCols2}>
            <div>
              <label className={businessProfileStyles.label}>
                Business Name
              </label>
              <input
                className={businessProfileStyles.input}
                value={meta.businessName || ""}
                onChange={(e) => updateMeta("businessName", e.target.value)}
                placeholder="Enter your business name"
              />
            </div>
            <div>
              <label className={businessProfileStyles.label}>Email</label>
              <input
                className={businessProfileStyles.input}
                value={meta.email || ""}
                onChange={(e) => updateMeta("email", e.target.value)}
                placeholder="business@example.com"
              />
            </div>
            <div className={businessProfileStyles.gridColSpan2}>
              <label className={businessProfileStyles.label}>
                Phone Number
              </label>
              <input
                className={businessProfileStyles.input}
                value={meta.phone || ""}
                onChange={(e) => updateMeta("phone", e.target.value)}
                placeholder="+1 808 808 0088"
              />
            </div>
            <div className={businessProfileStyles.gridColSpan2}>
              <label className={businessProfileStyles.label}>Address</label>
              <textarea
                rows={3}
                className={businessProfileStyles.textarea}
                value={meta.address || ""}
                onChange={(e) => updateMeta("address", e.target.value)}
                placeholder="Enter your business address"
              />
            </div>
            <div>
              <label className={businessProfileStyles.label}>GST Number</label>
              <input
                className={businessProfileStyles.input}
                value={meta.gst || ""}
                onChange={(e) => updateMeta("gst", e.target.value)}
                placeholder="GSTIN25ASSP1234Q1Z5"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Branding  */}
        <div className={businessProfileStyles.cardContainer}>
          <div className={businessProfileStyles.cardHeaderContainer}>
            <div
              className={`${businessProfileStyles.cardIconContainer} ${iconColors.branding}`}
            >
              <FiImage className="w-5 h-5" />
            </div>
            <h2 className={businessProfileStyles.cardTitle}>
              Branding & Defaults
            </h2>
          </div>

          <div className={businessProfileStyles.gridCols2Lg}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Company Logo
                </h3>

                <div className={businessProfileStyles.uploadArea}>
                  {previews.logo ? (
                    <div
                      className={businessProfileStyles.imagePreviewContainer}
                    >
                      <div className={businessProfileStyles.logoPreview}>
                        <img
                          src={previews.logo}
                          alt="logo preview"
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            console.warn(
                              "[BusinessProfile] logo preview failed to load:",
                              previews.logo,
                            );
                          }}
                        />
                      </div>
                      <div className={businessProfileStyles.buttonGroup}>
                        <label className={businessProfileStyles.changeButton}>
                          <FiUpload className="w-4 h-4" />
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleLocalFilePick("logo", e.target.files?.[0])
                            }
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeLocalFile("logo")}
                          className={businessProfileStyles.removeButton}
                        >
                          <FiTrash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div
                        className={`${businessProfileStyles.imagePreviewContainer} ${businessProfileStyles.hoverScale}`}
                      >
                        <div
                          className={businessProfileStyles.uploadIconContainer}
                        >
                          <FiUpload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className={businessProfileStyles.uploadTextTitle}>
                            Upload Logo
                          </p>
                          <p
                            className={businessProfileStyles.uploadTextSubtitle}
                          >
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleLocalFilePick("logo", e.target.files?.[0])
                          }
                          className="hidden"
                        />
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Tax Settings */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tax Settings
                </h3>
                <div className={businessProfileStyles.taxContainer}>
                  <label className={businessProfileStyles.label}>
                    Default Tax Percentage (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className={businessProfileStyles.taxInput}
                      value={meta.defaultTaxPercent ?? 18}
                      onChange={(e) =>
                        updateMeta(
                          "defaultTaxPercent",
                          Number(e.target.value) || 0,
                        )
                      }
                    />
                    <span className={customStyles.taxPercentage}>%</span>
                  </div>
                  <p className={businessProfileStyles.taxHelpText}>
                    This is the default tax rate applied to all invoices. You
                    can override it for individual invoices if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stamp & Signature */}
        <div className={businessProfileStyles.cardContainer}>
          <div className={businessProfileStyles.cardHeaderContainer}>
            <div
              className={`${businessProfileStyles.cardIconContainer} ${iconColors.assets}`}
            >
              <FiPenTool className="w-5 h-5" />
            </div>
            <h2 className={businessProfileStyles.cardTitle}>Digital Assets</h2>
          </div>

          <div className={businessProfileStyles.gridCols2Lg}>
            {/* Stamp */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Digital Stamp
              </h3>
              <div className={businessProfileStyles.uploadArea}>
                {previews.stamp ? (
                  <div className={businessProfileStyles.imagePreviewContainer}>
                    <div className={businessProfileStyles.stampPreview}>
                      <img
                        src={previews.stamp}
                        alt="stamp preview"
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          console.warn(
                            "[BusinessProfile] stamp preview failed to load:",
                            previews.stamp,
                          );
                        }}
                      />
                    </div>
                    <div className={businessProfileStyles.buttonGroup}>
                      <label className={businessProfileStyles.changeButton}>
                        <FiUpload className="w-4 h-4" /> Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleLocalFilePick("stamp", e.target.files?.[0])
                          }
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLocalFile("stamp")}
                        className={businessProfileStyles.removeButton}
                      >
                        <FiTrash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div
                      className={`${businessProfileStyles.imagePreviewContainer} ${businessProfileStyles.hoverScale}`}
                    >
                      <div
                        className={
                          businessProfileStyles.uploadSmallIconContainer
                        }
                      >
                        <FiImage className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={businessProfileStyles.uploadTextTitle}>
                          Upload Stamp
                        </p>
                        <p className={businessProfileStyles.uploadTextSubtitle}>
                          PNG with transparent background
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleLocalFilePick("stamp", e.target.files?.[0])
                        }
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Signature */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Digital Signature
              </h3>
              <div className={businessProfileStyles.uploadArea}>
                {previews.signature ? (
                  <div className={businessProfileStyles.imagePreviewContainer}>
                    <div className={businessProfileStyles.signaturePreview}>
                      <img
                        src={previews.signature}
                        alt="signature preview"
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          console.warn(
                            "[BusinessProfile] signature preview failed to load:",
                            previews.signature,
                          );
                        }}
                      />
                    </div>
                    <div className={businessProfileStyles.buttonGroup}>
                      <label className={businessProfileStyles.changeButton}>
                        <FiUpload className="w-4 h-4" /> Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleLocalFilePick(
                              "signature",
                              e.target.files?.[0],
                            )
                          }
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLocalFile("signature")}
                        className={businessProfileStyles.removeButton}
                      >
                        <FiTrash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div
                      className={`${businessProfileStyles.imagePreviewContainer} ${businessProfileStyles.hoverScale}`}
                    >
                      <div
                        className={
                          businessProfileStyles.uploadSmallIconContainer
                        }
                      >
                        <FiImage className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={businessProfileStyles.uploadTextTitle}>
                          Upload Signature
                        </p>
                        <p className={businessProfileStyles.uploadTextSubtitle}>
                          PNG with transparent background
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleLocalFilePick("signature", e.target.files?.[0])
                        }
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className={businessProfileStyles.label}>
                    Signature Owner Name
                  </label>
                  <input
                    placeholder="John Doe"
                    value={meta.signatureOwnerName || ""}
                    onChange={(e) =>
                      updateMeta("signatureOwnerName", e.target.value)
                    }
                    className={`${businessProfileStyles.input} ${customStyles.inputPlaceholder}`}
                  />
                </div>
                <div>
                  <label className={businessProfileStyles.label}>
                    Signature Title / Designation
                  </label>
                  <input
                    placeholder="Director / CEO"
                    value={meta.signatureOwnerTitle || ""}
                    onChange={(e) =>
                      updateMeta("signatureOwnerTitle", e.target.value)
                    }
                    className={`${businessProfileStyles.input} ${customStyles.inputPlaceholder}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={businessProfileStyles.actionContainer}>
          <div className={businessProfileStyles.actionInnerContainer}>
            <div className={businessProfileStyles.actionButtonGroup}>
              <button
                type="submit"
                onClick={handleSave}
                disabled={saving}
                className={businessProfileStyles.saveButton}
              >
                <FiSave />
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={handleClearProfile}
                className={businessProfileStyles.resetButton}
              >
                <TbRefresh />
                Clear Profile
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfile;
