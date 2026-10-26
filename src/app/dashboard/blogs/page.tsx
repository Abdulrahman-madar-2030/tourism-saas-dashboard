"use client";
import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaBox } from "react-icons/fa6";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import { Seo } from "@/types/seoTypes";
import { Blog, BlogForm } from "@/types/blogTypes";
import DataTable, { TableColumn } from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";
import { useCrud } from "@/hooks/useCrudQuery";
import Image from "next/image";

const blogFormSchema: FormField<BlogForm>[] = [
  {
    name: "title",
    label: "Blog Title",
    type: "text",
    required: true,
    placeholder: "Example: Best Travel Destinations",
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "example: best-destinations",
  },
  {
    name: "excerpt",
    label: "Excerpt",
    type: "textarea",
    required: true,
    placeholder: "A brief summary of the blog...",
  },
  {
    name: "content",
    label: "Blog Content",
    type: "editor",
    required: true,
    placeholder: "Write your blog content here...",
  },
  {
    name: "imageCover",
    label: "Cover Image",
    type: "singleImage",
    required: true,
  },
  {
    name: "alt",
    label: "Image Alt Text",
    type: "text",
    required: true,
  },
  {
    name: "tags",
    label: "Tags (comma separated)",
    type: "text",
    placeholder: "istanbul, travel, tourism",
  },
];

export default function BlogPage() {
  const {
    register,
    unregister,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BlogForm>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      alt: "",
      imageCover: undefined,
      tags: "",
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateSeoModal, setShowUpdateSeoModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [editingSeoBlog, setEditingSeoBlog] = useState<Blog | null>(null);

  const {
    data: blogs,
    isLoading,
    createItem: createBlog,
    updateItem: updateBlog,
    deleteItem: deleteBlog,
  } = useCrud<Blog[]>({
    queryKey: ["blogs"],
    endpoint: "/blogs",
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateSeoModal(false);
    },
  });

  const handleSeoSubmit = async (seoData: Seo) => {
    if (!editingSeoBlog?._id) return toast.error("المقال غير محدد");

    const formatBoolean = (val: string | boolean | undefined) =>
      val === true || val === "true" ? "true" : "false";

    const { alt, priority, changeFrequency, keywords, ...rest } = seoData;

    const body = {
      alt: alt || (editingSeoBlog.imageCover as { alt: string })?.alt || "",
      seo: {
        ...rest,
        priority: Number(priority),
        keywords: (keywords as string)?.split(","), //!!!!!!! needs fix
        changeFreq: changeFrequency,
        noIndex: formatBoolean(seoData.noIndex),
        noFollow: formatBoolean(seoData.noFollow),
        noArchive: formatBoolean(seoData.noArchive),
        noSnippet: formatBoolean(seoData.noSnippet),
      },
      imageCover: {
        url: (editingSeoBlog.imageCover as { url: string })?.url || "",
        alt: alt || (editingSeoBlog.imageCover as { alt: string })?.alt || "",
      },
    };

    await updateBlog({
      id: editingSeoBlog._id,
      endpoint: "/blogs/admin",
      body,
    });
    setShowUpdateSeoModal(false);
  };

  async function onSubmit(formData: BlogForm) {
    const { imageCover, alt, ...rest } = formData;
    const imageCoverFile = imageCover instanceof File ? imageCover : undefined;

    const tags =
      typeof formData.tags === "string"
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        : (formData.tags as string[]);

    const body = {
      ...rest,
      tags,
      imageCover:
        imageCover && !(imageCover instanceof File)
          ? {
              url:
                typeof imageCover === "string"
                  ? imageCover
                  : (imageCover as { url: string }).url,
              alt: alt || (imageCover as { alt: string }).alt || "",
            }
          : undefined,
    };

    const payload = {
      body,
      imageCover: imageCoverFile,
      imageCoverAlt: alt,
    };

    console.log("payload", payload);

    if (selectedBlog?._id) {
      await updateBlog({
        id: selectedBlog._id,
        endpoint: "/blogs/admin",
        ...payload,
      });
    } else {
      await createBlog({
        ...payload,
        endpoint: "/blogs",
      });
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <>
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedBlog(null);
          reset({
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            alt: "",
            tags: "",
          });
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormRenderer
            fields={blogFormSchema}
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="p-3 flex items-center justify-center bg-secondary/30 text-primary rounded-lg border-2 border-primary/40"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={showUpdateSeoModal}
        onClose={() => setShowUpdateSeoModal(false)}
      >
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            ...editingSeoBlog?.seo,
            slugUrl: editingSeoBlog?.slug,
            alt:
              editingSeoBlog?.alt ||
              (editingSeoBlog?.imageCover as { alt: string })?.alt ||
              "",
            priority: editingSeoBlog?.seo?.priority
              ? Number(editingSeoBlog.seo.priority)
              : 0.5,
            noIndex:
              editingSeoBlog?.seo?.noIndex === "true" ||
              editingSeoBlog?.seo?.noIndex === true,
            noFollow:
              editingSeoBlog?.seo?.noFollow === "true" ||
              editingSeoBlog?.seo?.noFollow === true,
            noArchive:
              editingSeoBlog?.seo?.noArchive === "true" ||
              editingSeoBlog?.seo?.noArchive === true,
            noSnippet:
              editingSeoBlog?.seo?.noSnippet === "true" ||
              editingSeoBlog?.seo?.noSnippet === true,
          }}
        />
      </Modal>

      <PageHeader
        pageName="المدونة"
        pageDescription="إدارة مقالات المدونة"
        PageIcon={FaBox}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems="المقالات" />
      </div>

      <DataTableHeader
        title="قائمة المقالات"
        action={
          <AddItemCard
            label="إضافة مقال جديد"
            setShowCreateModal={() => {
              setShowCreateModal(true);
              setSelectedBlog(null);
              setEditingSeoBlog(null);
              reset({
                title: "",
                slug: "",
                excerpt: "",
                content: "",
                alt: "",
                tags: "",
              });
            }}
          />
        }
      />

      <DataTable<Blog>
        data={blogs || []}
        columns={
          [
            {
              key: "imageCover",
              label: "Image",
              render: (item: Blog["imageCover"]) => (
                <Image
                  src={
                    (typeof item === "string"
                      ? item
                      : (item as { url: string })?.url) || "/placeholder.png"
                  }
                  alt="cover"
                  width={100}
                  height={100}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ),
            },
            {
              key: "title",
              label: "Title",
            },
            {
              key: "slug",
              label: "Slug",
            },
            {
              key: "excerpt",
              label: "Excerpt",
              render: (item: Blog["excerpt"]) => (
                <p className="max-w-[300px] truncate">{item}</p>
              ),
            },
            {
              key: "actions",
              label: "Actions",
            },
          ] satisfies TableColumn<Blog>[]
        }
        onEdit={(item: Blog) => {
          setEditingSeoBlog(null);
          setSelectedBlog(item);
          setShowCreateModal(true);
          reset({
            ...item,
            alt: (item.imageCover as { alt: string })?.alt || item.alt || "",
            tags: Array.isArray(item.tags)
              ? item.tags.join(", ")
              : (item.tags as unknown as string),
          });
          unregister("seo");
        }}
        onDelete={(id) => {
          deleteBlog(`/blogs/admin/${id}`);
        }}
        onSeo={(item: Blog) => {
          setEditingSeoBlog(item);
          setShowUpdateSeoModal(true);
        }}
      />
    </>
  );
}
