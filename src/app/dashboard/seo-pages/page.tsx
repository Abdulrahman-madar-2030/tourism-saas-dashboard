/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";
import React, { useState } from "react";
import { SeoPage, SeoPageForm } from "@/types/seoPageTypes";
import { useFieldArray, useForm } from "react-hook-form";

import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import DataTable from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import { MdDelete } from "react-icons/md";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { Seo } from "@/types/seoTypes";
import Spinner from "@/components/ui/Spinner/Spinner";
import { TbSeo } from "react-icons/tb";
import { useCrud } from "@/hooks/useCrudQuery";

const seoPageFormSchema: FormField<SeoPageForm>[] = [
  {
    name: "pageName",
    label: "اسم الصفحة (English)",
    type: "text",
    required: true,
    placeholder: "مثال: home",
  },
  {
    name: "title",
    label: "العنوان الرئيسي",
    type: "text",
    required: true,
    placeholder: "مثال: الرئيسية",
  },
  {
    name: "seo.slugUrl" as any,
    label: "slug",
    type: "text",
    required: true,
    placeholder: "مثال: home",
  },
  {
    name: "description",
    label: "وصف الصفحة",
    type: "text",
    required: true,
    placeholder: "وصف الصفحة",
    className: "col-span-2",
  },
];

export default function SeoPages() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SeoPage | null>(null);

  const {
    data: seoPages,
    isLoading,
    createItem: createSeoPage,
    updateItem: updateSeoPage,
    deleteItem: deleteSeoPage,
  } = useCrud({
    queryKey: ["seoPages"],
    endpoint: "/seo-pages",
    enabled: true,
    handleCloseModal: () => setIsModalOpen(false),
    useJsonPayload: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SeoPageForm>({});

  const {
    fields: sections,
    append: appendSections,
    remove: removeSections,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const handleAddPage = () => {
    reset({
      pageName: "",
      title: "",
      description: "",
      sections: [],
      seo: { slugUrl: "" } as any,
    });
    setSelectedPage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (page: SeoPage) => {
    const formattedSections = page.sections
      ? Object.entries(page.sections).map(([name, data]) => ({
          name,
          title: data.title,
          content: data.content,
        }))
      : [];
    reset({ ...page, sections: formattedSections });
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const handleEditSeo = (page: SeoPage) => {
    const formattedSections = page.sections
      ? Object.entries(page.sections).map(([name, data]) => ({
          name,
          title: data.title,
          content: data.content,
        }))
      : [];
    reset({ ...page, sections: formattedSections });
    setSelectedPage(page);
    setIsSeoModalOpen(true);
  };

  const handleDelete = (pageId: string) => {
    deleteSeoPage(`/seo-pages/admin/${pageId}`);
  };

  function onSubmit(data: SeoPageForm) {
    const transformedSections = data.sections?.reduce((acc: any, curr: any) => {
      if (curr.name) {
        acc[curr.name] = {
          title: curr.title,
          content: curr.content,
        };
      }
      return acc;
    }, {});

    if (selectedPage && selectedPage._id) {
      updateSeoPage({
        id: selectedPage._id,
        endpoint: "/seo-pages/admin",
        body: {
          pageName: data.pageName,
          title: data.title,
          description: data.description,
          sections: transformedSections,
          seo: {
            ...selectedPage.seo,
            slugUrl: data.seo?.slugUrl,
          },
        },
      });
    } else {
      createSeoPage({
        pageName: data.pageName,
        title: data.title,
        description: data.description,
        sections: transformedSections,
        seo: {
          slugUrl: data.seo?.slugUrl,
        },
      });
    }
  }

  function handleSeoSubmit(data: Seo) {
    const formatBoolean = (val: any) =>
      val === true || val === "true" ? "true" : "false";

    const { alt, keywords, priority, ...seoData } = data;
    const body = {
      alt: alt || "no alt",
      seo: {
        ...seoData,
        keywords: Array.isArray(keywords)
          ? keywords
          : typeof keywords === "string"
            ? keywords
                .split(",")
                .map((keyword) => keyword.trim())
                .filter(Boolean)
            : undefined,
        priority: Number(priority),
        noIndex: formatBoolean(data.noIndex),
        noFollow: formatBoolean(data.noFollow),
        noArchive: formatBoolean(data.noArchive),
        noSnippet: formatBoolean(data.noSnippet),
      },
    };

    if (selectedPage && selectedPage._id) {
      updateSeoPage({
        id: selectedPage._id,
        endpoint: `/seo-pages/admin`,
        body,
      });
      setIsSeoModalOpen(false);
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={setIsModalOpen}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-xl font-semibold border-b pb-2 mb-3">
            {selectedPage ? "تعديل صفحة SEO" : "إضافة صفحة SEO"}
          </h2>

          <div className="grid gap-3">
            <FormRenderer
              fields={seoPageFormSchema}
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
            />

            <div>
              <button
                type="button"
                className="bg-primary text-white rounded-2xl px-3 py-2 cursor-pointer hover:bg-primary/90 transition-colors duration-300 text-sm"
                onClick={() =>
                  appendSections({
                    title: "",
                    content: "",
                    name: "",
                  })
                }
              >
                + إضافة قسم
              </button>
            </div>
            {sections?.map((section, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-xl p-3 border border-border"
              >
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() => removeSections(index)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                  >
                    <MdDelete />
                  </button>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      label="اسم القسم"
                      name={`sections.${index}.name` as any}
                      register={register}
                      required={false}
                      error={errors.title}
                      placeholder="section name"
                    />

                    <FormInput
                      label="العنوان الرئيسي"
                      name={`sections.${index}.title` as any}
                      register={register}
                      required={false}
                      error={errors.title}
                      placeholder="section title"
                    />
                  </div>

                  <FormInput
                    label="المحتوى"
                    name={`sections.${index}.content` as any}
                    register={register}
                    required={false}
                    error={errors.title}
                    placeholder="section content text"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-end mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300"
            >
              حفظ
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isSeoModalOpen} onClose={setIsSeoModalOpen}>
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            priority: 1,
            changeFrequency: "always",
            alt: "no alt",
            ...selectedPage?.seo,
          }}
        />
      </Modal>

      <PageHeader
        pageName="صفحات SEO"
        pageDescription="إدارة محتوى السيو للصفحات الثابتة"
        PageIcon={TbSeo}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems="صفحات SEO" />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title="قائمة صفحات SEO"
          action={
            <AddItemCard
              label="اضافة صفحة جديدة"
              setShowCreateModal={handleAddPage}
            />
          }
        />

        <DataTable
          data={seoPages || []}
          itemsPerPage={Number.MAX_SAFE_INTEGER}
          columns={[
            { key: "pageName", label: "اسم الصفحة (English)" },
            { key: "title", label: "العنوان" },
            {
              key: "description",
              label: "الوصف",
              render: (val) => <p className="truncate max-w-xs">{val}</p>,
            },
            {
              key: "seo" as any,
              label: "Slug",
              render: (_, row: SeoPage) => (
                <span className="text-primary font-medium">
                  {row.seo?.slugUrl}
                </span>
              ),
            },
            {
              key: "createdAt",
              label: "تاريخ الإنشاء",
              render: (date) => new Date(date).toLocaleDateString("ar-EG"),
            },
            { key: "actions", label: "الإجراءات" },
          ]}
          onEdit={handleEdit}
          onDelete={(id) => handleDelete(id!)}
          onSeo={handleEditSeo}
        />
      </div>
    </div>
  );
}
