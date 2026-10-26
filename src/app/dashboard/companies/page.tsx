"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaArrowsRotate,
  FaPlus,
  FaBuildingCircleCheck,
  FaBuildingCircleXmark,
  FaBriefcase,
} from "react-icons/fa6";
import toast from "react-hot-toast";

import PageHeader from "@/components/ui/PageHeader/PageHeader";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import DataTable, { TableColumn } from "@/components/ui/DataTable/DataTable";
import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import Modal from "@/components/ui/Modal/Modal";
import Spinner from "@/components/ui/Spinner/Spinner";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import { useCrud } from "@/hooks/useCrudQuery";
import { Company, CompanyForm } from "@/types/companyTypes";

const STATUS_OPTIONS = [
  { label: "نشطة (Active)", value: "active" },
  { label: "معطلة (Inactive)", value: "inactive" },
];

const FILTER_STATUS_OPTIONS = [
  { label: "جميع الحالات", value: "ALL" },
  { label: "الشركات النشطة فقط", value: "active" },
  { label: "الشركات المعطلة فقط", value: "inactive" },
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0621-\u064A-]+/g, "")
    .replace(/--+/g, "-");
}

export default function CompaniesPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CompanyForm>({
    defaultValues: {
      name: "",
      slug: "",
      contactEmail: "",
      contactPhone: "",
      status: "active",
    },
  });

  const {
    data: rawCompanies,
    isLoading,
    refetch,
    isRefetching,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud<Company[]>({
    queryKey: ["companies"],
    endpoint: "/companies",
    select: (res: any) => {
      const arr = res?.data?.data ?? res?.data ?? res;
      return Array.isArray(arr) ? arr : [];
    },
    handleCloseModal: () => {
      setShowModal(false);
      setSelectedCompany(null);
    },
  });

  const companiesList: Company[] = useMemo(() => {
    return Array.isArray(rawCompanies) ? rawCompanies : [];
  }, [rawCompanies]);

  // Statistics
  const stats = useMemo(() => {
    const total = companiesList.length;
    const active = companiesList.filter((c) => c.status === "active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [companiesList]);

  // Filtered by status
  const filteredCompanies = useMemo(() => {
    if (statusFilter === "ALL") return companiesList;
    return companiesList.filter((c) => c.status === statusFilter);
  }, [companiesList, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedCompany(null);
    reset({
      name: "",
      slug: "",
      contactEmail: "",
      contactPhone: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (company: Company) => {
    setSelectedCompany(company);
    reset({
      _id: company._id,
      name: company.name || "",
      slug: company.slug || "",
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
      status: (company.status as "active" | "inactive") || "active",
    });
    setShowModal(true);
  };

  const handleGenerateSlug = () => {
    const nameVal = watch("name");
    if (nameVal) {
      setValue("slug", slugify(nameVal), { shouldDirty: true });
    }
  };

  const onSubmit = async (formData: CompanyForm) => {
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || slugify(formData.name),
        contactEmail: formData.contactEmail?.trim() || undefined,
        contactPhone: formData.contactPhone?.trim() || undefined,
        status: formData.status || "active",
      };

      if (selectedCompany?._id) {
        await updateItem({
          id: selectedCompany._id,
          endpoint: "/companies",
          body: payload,
        });
        toast.success("تم تحديث بيانات الشركة بنجاح");
      } else {
        await createItem({
          endpoint: "/companies",
          ...payload,
        });
        toast.success("تم إضافة الشركة بنجاح");
      }

      setShowModal(false);
      setSelectedCompany(null);
      reset();
      refetch();
    } catch (err: any) {
      console.error("Save company error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "فشل حفظ بيانات الشركة";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(`/companies/${id}`);
      toast.success("تم حذف الشركة بنجاح");
      setDeleteConfirmId(null);
      refetch();
    } catch (err: any) {
      console.error("Delete company error:", err);
      toast.error(err?.response?.data?.message || "فشل حذف الشركة");
    }
  };

  const columns: TableColumn<Company>[] = [
    {
      key: "name",
      label: "اسم الشركة",
      sortable: true,
      render: (name: string, row: Company) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center font-bold text-sm border border-primary/10 shadow-xs flex-shrink-0">
            {name ? name.charAt(0).toUpperCase() : <FaBuilding className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm block truncate">
              {name || "بدون اسم"}
            </span>
            {row.slug && (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md inline-block mt-0.5" dir="ltr">
                @{row.slug}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "contactEmail",
      label: "بيانات التواصل",
      render: (_, row: Company) => (
        <div className="space-y-1 text-xs">
          {row.contactEmail ? (
            <a
              href={`mailto:${row.contactEmail}`}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              dir="ltr"
            >
              <FaEnvelope className="w-3 h-3 text-muted-foreground/70" />
              <span>{row.contactEmail}</span>
            </a>
          ) : (
            <span className="text-muted-foreground/50 text-[11px]">— لا يوجد بريد</span>
          )}
          {row.contactPhone ? (
            <a
              href={`tel:${row.contactPhone}`}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              dir="ltr"
            >
              <FaPhone className="w-3 h-3 text-muted-foreground/70" />
              <span>{row.contactPhone}</span>
            </a>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      label: "الحالة",
      sortable: true,
      render: (status: string) => {
        const isActive = status === "active";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isActive
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-slate-500/10 text-slate-600 border-slate-500/20"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {isActive ? "نشطة" : "معطلة"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "تاريخ الإنشاء",
      sortable: true,
      render: (val?: string) => {
        if (!val) return <span className="text-muted-foreground text-xs">—</span>;
        const date = new Date(val);
        return (
          <span className="text-xs text-muted-foreground">
            {isNaN(date.getTime()) ? val : date.toLocaleDateString("ar-SA")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "الإجراءات",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner />
        <span className="text-xs text-muted-foreground">جاري تحميل بيانات الشركات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        pageName="إدارة الشركات والوكالات السياحية (SaaS Tenants)"
        pageDescription="إدارة وكالات السفر والشركات السياحية المشتركة بالمنظومة السحابية ومتابعة بياناتها وحالاتها التشغيلية"
        PageIcon={FaBuilding}
      />

      <div className="flex items-center justify-between">
        <BreadCrumb breadCrumbItems="إدارة الشركات" />

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted/30 transition-all cursor-pointer"
          title="تحديث البيانات"
        >
          <FaArrowsRotate className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">إجمالي الشركات</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FaBriefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">الشركات النشطة</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FaBuildingCircleCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">الشركات المعطلة</p>
            <p className="text-2xl font-bold text-slate-500 mt-1">{stats.inactive}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
            <FaBuildingCircleXmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
          <div className="flex-1 max-w-xs">
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              تصفية حسب الحالة:
            </label>
            <SelectMenu
              value={statusFilter}
              onChange={(val) => setStatusFilter(String(val))}
              options={FILTER_STATUS_OPTIONS}
              placeholder="تصفية بالحالة"
            />
          </div>

          <div className="self-end sm:self-auto">
            <AddItemCard
              label="إضافة شركة جديدة"
              setShowCreateModal={handleOpenCreate}
            />
          </div>
        </div>

        <DataTableHeader
          title="سجل الشركات"
          description={`عرض كافة الشركات المسجلة (${filteredCompanies.length} شركة)`}
        />

        <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
          <DataTable
            data={filteredCompanies}
            columns={columns}
            searchable={true}
            sortable={true}
            itemsPerPage={10}
            onEdit={handleOpenEdit}
            onDelete={(id) => setDeleteConfirmId(id)}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCompany(null);
          reset();
        }}
        className="max-w-lg"
      >
        <div className="p-2 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FaBuilding className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {selectedCompany ? "تعديل بيانات الشركة" : "إضافة شركة جديدة"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedCompany
                  ? "قم بتحديث معلومات الشركة وتفاصيل التواصل"
                  : "أدخل بيانات الشركة السياحية الجديدة لربطها بالنظام"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                اسم الشركة <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("name", {
                  required: "يرجى كتابة اسم الشركة",
                })}
                placeholder="مثال: شركة السياحة الثانية"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden"
              />
              {errors.name && (
                <span className="text-[11px] text-destructive mt-1 block">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  المعرف الفريد (Slug)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  توليد من الاسم تلقائياً
                </button>
              </div>
              <input
                type="text"
                dir="ltr"
                {...register("slug")}
                placeholder="tourism-company-two"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                يُستخدم في الروابط والمعرفات البرمجية (حروف إنجليزية وشرطات)
              </p>
            </div>

            {/* Contact Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  dir="ltr"
                  {...register("contactEmail", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "بريد إلكتروني غير صالح",
                    },
                  })}
                  placeholder="contact@company.com"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden font-sans"
                />
                {errors.contactEmail && (
                  <span className="text-[11px] text-destructive mt-1 block">
                    {errors.contactEmail.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  رقم الهاتف للتواصل
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  {...register("contactPhone")}
                  placeholder="+201001234567"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                حالة الشركة
              </label>
              <SelectMenu
                name="status"
                control={control}
                options={STATUS_OPTIONS}
                placeholder="اختر الحالة"
                placement="top"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-border mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : selectedCompany ? (
                  "حفظ التعديلات"
                ) : (
                  "إضافة الشركة"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                  reset();
                }}
                className="px-5 h-10 rounded-xl border border-border bg-background hover:bg-muted/40 text-foreground text-xs font-semibold transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        className="max-w-sm"
      >
        <div className="p-3 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <FaBuildingCircleXmark className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground">تأكيد حذف الشركة</h3>
            <p className="text-xs text-muted-foreground mt-1">
              هل أنت متأكد من رغبتك في حذف هذه الشركة؟ قد يؤثر ذلك على المستخدمين المرتبطين بها.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors cursor-pointer"
            >
              نعم، حذف
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 h-10 rounded-xl border border-border bg-background hover:bg-muted/40 text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
