"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { CheckCircle2, Send, Loader2, Eye, EyeOff, Info, AlertCircle, Download, FileText, User, Phone, Mail, MessageCircle, Facebook, Instagram, Briefcase, CreditCard, GraduationCap } from "lucide-react";
import styles from "./alumni-form.module.css";

interface FormData {
  fullName: string;
  nationalId: string;
  studentId: string;
  workInfo: string;
  phone: string;
  email: string;
  lineId: string;
  facebook: string;
  instagram: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface InputFieldProps {
  icon: React.ElementType;
  placeholder: string;
  type?: string;
  field: keyof FormData;
  required?: boolean;
  info?: string;
  value: string;
  hasError: boolean;
  errorMessage?: string;
  isValid: boolean;
  isFocused: boolean;
  showNationalId?: boolean;
  onInputChange: (field: keyof FormData, value: string) => void;
  onFocus: (field: string) => void;
  onBlur: (field: keyof FormData) => void;
  onToggleNationalId?: () => void;
}

// ย้าย InputField ออกมานอก component และใช้ React.memo
const InputField = memo<InputFieldProps>(({
  icon: Icon,
  placeholder,
  type = "text",
  field,
  required = false,
  info,
  value,
  hasError,
  errorMessage,
  isValid,
  isFocused,
  showNationalId,
  onInputChange,
  onFocus,
  onBlur,
  onToggleNationalId,
}) => {
  // ใช้ local state สำหรับ input value เพื่อลด re-render
  const [localValue, setLocalValue] = useState(value);

  // Sync กับ parent value เมื่อมีการ reset form
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onInputChange(field, newValue);
  }, [field, onInputChange]);

  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputGroup}>
        <div
          className={`${styles.inputIcon} ${
            isFocused ? styles.focused : ""
          } ${hasError ? styles.error : ""}`}
        >
          <Icon size={20} />
        </div>

        {field === "nationalId" && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onToggleNationalId}
            tabIndex={-1}
            aria-label={
              showNationalId ? "ซ่อนเลขบัตรประชาชน" : "แสดงเลขบัตรประชาชน"
            }
          >
            {showNationalId ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        <input
          name={field}
          type={
            field === "nationalId"
              ? showNationalId
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          required={required}
          value={localValue}
          onChange={handleChange}
          onFocus={() => onFocus(field)}
          onBlur={() => onBlur(field)}
          className={`${styles.inputField} ${
            localValue ? styles.hasValue : ""
          } ${hasError ? styles.hasError : ""}`}
          autoComplete={
            field === "email" ? "email" : field === "phone" ? "tel" : "off"
          }
        />

        {required && <span className={styles.requiredMark}>*</span>}

        {isValid && field !== "nationalId" && (
          <CheckCircle2 className={styles.validIcon} size={16} />
        )}

        {field === "nationalId" && localValue && isValid && (
          <span
            className={`${styles.digitCounter} ${
              hasError ? styles.error : ""
            }`}
          >
            {localValue.replace(/\D/g, "").length}/13
          </span>
        )}
      </div>

      {info && isFocused && !hasError && (
        <div className={styles.infoBox}>
          <Info size={14} />
          <span>{info}</span>
        </div>
      )}

      {hasError && errorMessage && (
        <div className={styles.errorMessage}>
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - re-render only when necessary
  return (
    prevProps.value === nextProps.value &&
    prevProps.hasError === nextProps.hasError &&
    prevProps.errorMessage === nextProps.errorMessage &&
    prevProps.isValid === nextProps.isValid &&
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.showNationalId === nextProps.showNationalId
  );
});

InputField.displayName = 'InputField';

export default function AlumniFormPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    nationalId: "",
    studentId: "",
    workInfo: "",
    phone: "",
    email: "",
    lineId: "",
    facebook: "",
    instagram: "",
  });

  const [focused, setFocused] = useState<string>("");
  const [showNationalId, setShowNationalId] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<keyof FormData>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Calculate completion percentage
  useEffect(() => {
    const allFields = Object.keys(formData);
    const filledFields = allFields.filter(
      (field) => formData[field as keyof FormData] !== ""
    );
    const percentage = Math.round(
      (filledFields.length / allFields.length) * 100
    );
    setCompletionPercentage(percentage);
  }, [formData]);

  const validateField = useCallback((field: keyof FormData, value: string): string => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "กรุณากรอกชื่อ-สกุล";
        if (value.trim().length < 3) return "ชื่อต้องมีอย่างน้อย 3 ตัวอักษร";
        return "";

      case "nationalId":
        if (!value) return "กรุณากรอกเลขบัตรประชาชน";
        const cleanedId = value.replace(/\D/g, "");
        if (cleanedId.length !== 13) {
          return `กรอกไม่ครบ (${cleanedId.length}/13 หลัก)`;
        }
        if (!/^\d{13}$/.test(cleanedId)) {
          return "เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น";
        }
        return "";

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "รูปแบบอีเมลไม่ถูกต้อง";
        }
        return "";

      case "phone":
        const cleanedPhone = value.replace(/\D/g, "");
        if (value && (cleanedPhone.length < 9 || cleanedPhone.length > 10)) {
          return "เบอร์โทรศัพท์ต้องมี 9-10 หลัก";
        }
        if (value && !/^[0-9]+$/.test(cleanedPhone)) {
          return "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น";
        }
        return "";

      case "studentId":
        if (value && !/^\d{7}$/.test(value)) {
          return "รหัสนักศึกษาต้องเป็นตัวเลข 7 หลัก";
        }
        return "";

      default:
        return "";
    }
  }, []);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched((prev) => new Set(prev).add(field));
    
    setFormData((currentData) => {
      const error = validateField(field, currentData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
      return currentData;
    });
  }, [validateField]);

  const handleFocus = useCallback((field: string) => {
    setFocused(field);
  }, []);

  const handleToggleNationalId = useCallback(() => {
    setShowNationalId((prev) => !prev);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const allFields = Object.keys(formData) as Array<keyof FormData>;
    setTouched(new Set(allFields));

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(
          `[name="${firstErrorField}"]`
        );
        errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Alumni data submitted:", formData);
      setShowSuccessAnimation(true);

      localStorage.removeItem("alumniFormDraft");

      setTimeout(() => {
        setShowSuccessAnimation(false);
        setFormData({
          fullName: "",
          nationalId: "",
          studentId: "",
          workInfo: "",
          phone: "",
          email: "",
          lineId: "",
          facebook: "",
          instagram: "",
        });
        setTouched(new Set());
        setErrors({});
        setCompletionPercentage(0);
      }, 3000);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
    }
  };

  const exportData = useCallback((): void => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;
    const exportFileDefaultName = `alumni_${formData.fullName || "data"}_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  }, [formData]);

  // Helper function สำหรับ check isValid
  const getIsValid = useCallback((field: keyof FormData): boolean => {
    return !!(formData[field] && !errors[field] && touched.has(field));
  }, [formData, errors, touched]);

  return (
    <div className={styles.container}>
      {/* Background decorative elements */}
      <div className={styles.backgroundDecorations}>
        <div
          className={`${styles.decorativeCircle} ${styles.decorativeCircle1}`}
        ></div>
        <div
          className={`${styles.decorativeCircle} ${styles.decorativeCircle2}`}
        ></div>
        <div
          className={`${styles.decorativeCircle} ${styles.decorativeCircle3}`}
        ></div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className={styles.successOverlay}>
          <div className={styles.successContent}>
            <CheckCircle2 size={80} className={styles.successIcon} />
            <h2>ส่งข้อมูลสำเร็จ!</h2>
            <p>ขอบคุณสำหรับข้อมูลของคุณ</p>
          </div>
        </div>
      )}

      <main className={styles.main} lang="th">
        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {completionPercentage}% สมบูรณ์
          </span>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <GraduationCap size={32} />
          </div>
          <h1 className={styles.title}>แบบฟอร์มกรอกข้อมูลศิษย์เก่า</h1>
          <p className={styles.subtitle}>กรุณากรอกข้อมูลของท่านให้ครบถ้วน</p>
          <div className={styles.divider}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formCard} ref={formRef}>
            {/* Personal Information Section */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionHeader}>
                <User className={styles.personalIcon} size={24} />
                ข้อมูลส่วนตัว
              </h2>
              <div className={styles.fieldsGrid}>
                <InputField
                  icon={User}
                  placeholder="ชื่อ-สกุล"
                  field="fullName"
                  required
                  info="กรอกชื่อและนามสกุลเต็ม"
                  value={formData.fullName}
                  hasError={!!errors.fullName && touched.has("fullName")}
                  errorMessage={errors.fullName}
                  isValid={getIsValid("fullName")}
                  isFocused={focused === "fullName"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <InputField
                  icon={CreditCard}
                  placeholder="เลขที่บัตรประชาชน"
                  field="nationalId"
                  required
                  info="กรอกเลข 13 หลัก"
                  value={formData.nationalId}
                  hasError={!!errors.nationalId && touched.has("nationalId")}
                  errorMessage={errors.nationalId}
                  isValid={touched.has("nationalId")}
                  isFocused={focused === "nationalId"}
                  showNationalId={showNationalId}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onToggleNationalId={handleToggleNationalId}
                />
                <InputField
                  icon={GraduationCap}
                  placeholder="รหัสนักศึกษา"
                  field="studentId"
                  info="รหัสนักศึกษา 7 หลัก"
                  value={formData.studentId}
                  hasError={!!errors.studentId && touched.has("studentId")}
                  errorMessage={errors.studentId}
                  isValid={getIsValid("studentId")}
                  isFocused={focused === "studentId"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <InputField
                  icon={Briefcase}
                  placeholder="ข้อมูลการทำงาน (ตำแหน่ง/บริษัท)"
                  field="workInfo"
                  info="เช่น Software Engineer ที่ ABC Company"
                  value={formData.workInfo}
                  hasError={!!errors.workInfo && touched.has("workInfo")}
                  errorMessage={errors.workInfo}
                  isValid={getIsValid("workInfo")}
                  isFocused={focused === "workInfo"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionHeader}>
                <Phone className={styles.contactIcon} size={24} />
                ข้อมูลการติดต่อ
              </h2>
              <div className={styles.fieldsGrid}>
                <InputField
                  icon={Phone}
                  placeholder="เบอร์โทรศัพท์"
                  type="tel"
                  field="phone"
                  info="เบอร์มือถือ 9-10 หลัก"
                  value={formData.phone}
                  hasError={!!errors.phone && touched.has("phone")}
                  errorMessage={errors.phone}
                  isValid={getIsValid("phone")}
                  isFocused={focused === "phone"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <InputField
                  icon={Mail}
                  placeholder="E-mail"
                  type="email"
                  field="email"
                  info="อีเมลสำหรับติดต่อ"
                  value={formData.email}
                  hasError={!!errors.email && touched.has("email")}
                  errorMessage={errors.email}
                  isValid={getIsValid("email")}
                  isFocused={focused === "email"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Social Media Section */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionHeader}>
                <MessageCircle className={styles.socialIcon} size={24} />
                โซเชียลมีเดีย
              </h2>
              <div className={styles.fieldsGrid}>
                <InputField
                  icon={MessageCircle}
                  placeholder="ID Line"
                  field="lineId"
                  info="Line ID สำหรับติดต่อ"
                  value={formData.lineId}
                  hasError={!!errors.lineId && touched.has("lineId")}
                  errorMessage={errors.lineId}
                  isValid={getIsValid("lineId")}
                  isFocused={focused === "lineId"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <InputField
                  icon={Facebook}
                  placeholder="Facebook (URL หรือชื่อ)"
                  field="facebook"
                  info="ลิงก์โปรไฟล์หรือชื่อ Facebook"
                  value={formData.facebook}
                  hasError={!!errors.facebook && touched.has("facebook")}
                  errorMessage={errors.facebook}
                  isValid={getIsValid("facebook")}
                  isFocused={focused === "facebook"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <InputField
                  icon={Instagram}
                  placeholder="Instagram (@username)"
                  field="instagram"
                  info="Username Instagram (รวม @)"
                  value={formData.instagram}
                  hasError={!!errors.instagram && touched.has("instagram")}
                  errorMessage={errors.instagram}
                  isValid={getIsValid("instagram")}
                  isFocused={focused === "instagram"}
                  onInputChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={exportData}
                className={styles.secondaryButton}
                disabled={completionPercentage === 0}
              >
                <Download size={18} />
                ดาวน์โหลดข้อมูล
              </button>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className={styles.spinIcon} size={20} />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    ส่งข้อมูล
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p>ข้อมูลของท่านจะถูกเก็บรักษาอย่างปลอดภัย</p>
          <p className={styles.footerNote}>
            <FileText size={14} />
            หากมีข้อสงสัย ติดต่อ alumni@rsu.ac.th
          </p>
        </div>
      </main>
    </div>
  );
}
