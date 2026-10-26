"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  FaUserShield,
  FaUsers,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowsRotate,
  FaUserGear,
  FaUserCheck,
  FaTrashCan,
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
import { useCrud } from "@/hooks/useCrudQuery";
import { User, UserForm } from "@/types/usersTypes";
import { Company } from "@/types/companyTypes";

const ROLE_OPTIONS = [
  { label: "مشرف عام (Admin)", value: "admin" },
  { label: "مدير (Manager)", value: "manager" },
  { label: "مدخل بيانات (Data Entry)", value: "data-entry" },
  { label: "مستخدم عادي (User)", value: "user" },
];

const FILTER_ROLE_OPTIONS = [
  { label: "جميع الأدوار", value: "ALL" },
  { label: "مشرف (Admin)", value: "admin" },
  { label: "مدير (Manager)", value: "manager" },
  { label: "مدخل بيانات (Data Entry)", value: "data-entry" },
  { label: "مستخدم (User)", value: "user" },
];

export default function UsersManagement() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
      company: "",
      isActive: true,
    },
  });

  // Fetch users
  const {
    data: rawUsers,
    isLoading: isUsersLoading,
    refetch,
    isRefetching,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud<User[]>({
    queryKey: ["users"],
    endpoint: "/users",
    select: (res: any) => {
      const arr = res?.data?.data ?? res?.data ?? res;
      return Array.isArray(arr) ? arr : [];
    },
    handleCloseModal: () => {
      setShowModal(false);
      setSelectedUser(null);
    },
  });

  // Fetch companies for dropdown selection
  const { data: rawCompanies, isLoading: isCompaniesLoading } = useCrud<Company[]>({
    queryKey: ["companies"],
    endpoint: "/companies",
    select: (res: any) => {
      const arr = res?.data?.data ?? res?.data ?? res;
      return Array.isArray(arr) ? arr : [];
    },
  });

  const usersList: User[] = useMemo(() => {
    return Array.isArray(rawUsers) ? rawUsers : [];
  }, [rawUsers]);

  const companiesList: Company[] = useMemo(() => {
    return Array.isArray(rawCompanies) ? rawCompanies : [];
  }, [rawCompanies]);

  // Companies mapping for quick label resolution
  const companiesMap = useMemo(() => {
    const map = new Map<string, string>();
    companiesList.forEach((c) => {
      if (c._id) map.set(c._id, c.name);
    });
    return map;
  }, [companiesList]);

  // Company options for Form SelectMenu
  const companyOptions = useMemo(() => {
    return [
      { label: "بدون شركة (غير محدد)", value: "" },
      ...companiesList.map((c) => ({
        label: c.name,
        value: c._id,
      })),
    ];
  }, [companiesList]);

  // Company options for Filter
  const filterCompanyOptions = useMemo(() => {
    return [
      { label: "جميع الشركات", value: "ALL" },
      ...companiesList.map((c) => ({
        label: c.name,
        value: c._id,
      })),
    ];
  }, [companiesList]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = usersList.length;
    const admins = usersList.filter((u) => u.role === "admin").length;
    const managers = usersList.filter((u) => u.role === "manager").length;
    const dataEntries = usersList.filter((u) => u.role === "data-entry").length;
    return { total, admins, managers, dataEntries };
  }, [usersList]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const matchRole = roleFilter === "ALL" || user.role === roleFilter;
      const userCompanyId =
        typeof user.company === "object"
          ? (user.company as any)?._id
          : user.company;
      const matchCompany =
        companyFilter === "ALL" || userCompanyId === companyFilter;
      return matchRole && matchCompany;
    });
  }, [usersList, roleFilter, companyFilter]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setShowPassword(false);
    reset({
      name: "",
      email: "",
      password: "",
      role: "admin",
      company: companiesList[0]?._id || "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setShowPassword(false);
    const companyId =
      typeof user.company === "object"
        ? (user.company as any)?._id || ""
        : user.company || "";

    reset({
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      password: "", // Left blank on edit unless intentionally changing
      role: user.role || "data-entry",
      company: companyId,
      isActive: user.isActive !== false,
    });
    setShowModal(true);
  };

  const onSubmit = async (formData: UserForm) => {
    try {
      // Build the exact payload required by the API
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role || "admin",
      };

      if (formData.company) {
        payload.company = formData.company;
      }

      // Password: required on create, optional on update
      if (formData.password && formData.password.trim().length > 0) {
        payload.password = formData.password.trim();
      }

      if (selectedUser?._id) {
        await updateItem({
          id: selectedUser._id,
          endpoint: "/users",
          body: payload,
        });
        toast.success("تم تحديث بيانات المستخدم بنجاح");
      } else {
        if (!payload.password) {
          toast.error("يرجى إدخال كلمة المرور للمستخدم الجديد");
          return;
        }

        await createItem({
          endpoint: "/users",
          ...payload,
        });
        toast.success("تم إنشاء المستخدم بنجاح");
      }

      setShowModal(false);
      setSelectedUser(null);
      reset();
      refetch();
    } catch (err: any) {
      console.error("Save user error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "فشل حفظ بيانات المستخدم";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(`/users/${id}`);
      toast.success("تم حذف المستخدم بنجاح");
      setDeleteConfirmId(null);
      refetch();
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error(err?.response?.data?.message || "فشل حذف المستخدم");
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <FaUserShield className="w-3 h-3" />
            <span>مشرف عام (Admin)</span>
          </span>
        );
      case "manager":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <FaUserGear className="w-3 h-3" />
            <span>مدير (Manager)</span>
          </span>
        );
      case "data-entry":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <FaUserCheck className="w-3 h-3" />
            <span>مدخل بيانات (Data Entry)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">
            <span>{role || "مستخدم"}</span>
          </span>
        );
    }
  };

  const columns: TableColumn<User>[] = [
    {
      key: "name",
      label: "المستخدم",
      sortable: true,
      render: (name: string, row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center font-bold text-sm border border-primary/10 shadow-xs flex-shrink-0">
            {name ? name.charAt(0).toUpperCase() : <FaUsers className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm block truncate">
              {name || "بدون اسم"}
            </span>
            <span className="text-xs text-muted-foreground block truncate" dir="ltr">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "الدور والصلاحية",
      sortable: true,
      render: (role: string) => getRoleBadge(role),
    },
    {
      key: "company" as any,
      label: "الشركة التابع لها",
      render: (_, row: User) => {
        const companyId =
          typeof row.company === "object"
            ? (row.company as any)?._id
            : row.company;
        const companyName =
          typeof row.company === "object" && (row.company as any)?.name
            ? (row.company as any).name
            : companyId
            ? companiesMap.get(companyId)
            : null;

        if (companyName) {
          return (
            <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
              <FaBuilding className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{companyName}</span>
            </div>
          );
        }

        return (
          <span className="text-muted-foreground/60 text-xs">— غير محدد</span>
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

  if (isUsersLoading || isCompaniesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner />
        <span className="text-xs text-muted-foreground">جاري تحميل بيانات المستخدمين والشركات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        pageName="إدارة مستخدمي ومشرفي المنظومة (SaaS Users & Roles)"
        pageDescription="إدارة حسابات المشرفين، المدراء، وفرق عمل وكالات السياحة وربطهم بشركاتهم وتحديد صلاحياتهم السحابية"
        PageIcon={FaUserShield}
      />

      <div className="flex items-center justify-between">
        <BreadCrumb breadCrumbItems="إدارة المستخدمين" />

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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">إجمالي المستخدمين</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FaUsers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">المشرفين (Admins)</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.admins}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <FaUserShield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">المدراء (Managers)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.managers}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <FaUserGear className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">مدخلي البيانات</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.dataEntries}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <FaUserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-xl">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                تصفية حسب الدور:
              </label>
              <SelectMenu
                value={roleFilter}
                onChange={(val) => setRoleFilter(String(val))}
                options={FILTER_ROLE_OPTIONS}
                placeholder="تصفية بالدور"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                تصفية حسب الشركة:
              </label>
              <SelectMenu
                value={companyFilter}
                onChange={(val) => setCompanyFilter(String(val))}
                options={filterCompanyOptions}
                placeholder="تصفية بالشركة"
              />
            </div>
          </div>

          <div className="self-end md:self-auto">
            <AddItemCard
              label="إضافة مستخدم جديد"
              setShowCreateModal={handleOpenCreate}
            />
          </div>
        </div>

        <DataTableHeader
          title="قائمة المستخدمين"
          description={`عرض كافة الحسابات المسجلة (${filteredUsers.length} مستخدم)`}
        />

        <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
          <DataTable
            data={filteredUsers}
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
          setSelectedUser(null);
          reset();
        }}
        className="max-w-lg"
      >
        <div className="p-2 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FaUserShield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {selectedUser ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedUser
                  ? "قم بتحديث معلومات الحساب والصلاحيات والشركة"
                  : "أدخل بيانات حساب المستخدم والشركة التابع لها"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                الاسم الكامل <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("name", {
                  required: "يرجى كتابة اسم المستخدم",
                })}
                placeholder="مثال: Admin الشركة التانية"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden"
              />
              {errors.name && (
                <span className="text-[11px] text-destructive mt-1 block">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                البريد الإلكتروني <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                dir="ltr"
                {...register("email", {
                  required: "يرجى كتابة البريد الإلكتروني",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "صيغة بريد إلكتروني غير صالحة",
                  },
                })}
                placeholder="admin2@ss.com"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden font-sans"
              />
              {errors.email && (
                <span className="text-[11px] text-destructive mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  كلمة المرور {!selectedUser && <span className="text-destructive">*</span>}
                </label>
                {selectedUser && (
                  <span className="text-[11px] text-muted-foreground">
                    (اتركها فارغة إذا كنت لا ترغب بتغييرها)
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  {...register("password", {
                    required: !selectedUser ? "يرجى كتابة كلمة المرور" : false,
                    minLength: {
                      value: 6,
                      message: "كلمة المرور يجب أن لا تقل عن 6 أحرف",
                    },
                  })}
                  placeholder={
                    selectedUser
                      ? "•••••••• (بدون تغيير)"
                      : "مثال: Password@123"
                  }
                  className="w-full h-10 px-3.5 pl-10 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] text-destructive mt-1 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Role & Company Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  الدور / الصلاحية <span className="text-destructive">*</span>
                </label>
                <SelectMenu
                  name="role"
                  control={control}
                  options={ROLE_OPTIONS}
                  placeholder="اختر الدور"
                  placement="top"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  الشركة التابع لها
                </label>
                <SelectMenu
                  name="company"
                  control={control}
                  options={companyOptions}
                  placeholder="اختر الشركة"
                  searchable={true}
                  placement="top"
                />
              </div>
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
                ) : selectedUser ? (
                  "حفظ التعديلات"
                ) : (
                  "إنشاء المستخدم"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
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
            <FaTrashCan className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground">تأكيد حذف الحساب</h3>
            <p className="text-xs text-muted-foreground mt-1">
              هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ لن يتمكن من تسجيل الدخول للنظام بعد الحذف.
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
