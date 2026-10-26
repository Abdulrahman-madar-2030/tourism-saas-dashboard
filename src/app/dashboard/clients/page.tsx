"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import { MdEmail } from "react-icons/md";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import {
  FaEnvelope,
  FaPlane,
  FaPlaneArrival,
  FaPlaneDeparture,
  FaPeopleGroup,
  FaEye,
} from "react-icons/fa6";
import { useCrud } from "@/hooks/useCrudQuery";
import DataTable from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import Modal from "@/components/ui/Modal/Modal";
import Spinner from "@/components/ui/Spinner/Spinner";

type EntityType = "contact" | "flight-bookings";

export default function ContactAndBookingsPage() {
  const [activeTab, setActiveTab] = useState<EntityType>("contact");
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const message = `السلام عليكم، نتواصل مع حضرتكم من منصة خدمات السفر والسياحة
* من فضلك أخبرنا كيف يمكننا مساعدتك من خلال استكمال البيانات:

- عدد الأشخاص / أعمار الأطفال
- تاريخ وتوقيت السفر
- عدد الأيام المطلوبة
- مدينة ومطار الإقلاع

وسيتم التواصل معكم ومتابعة الحجز في أسرع وقت.
شكراً لثقتكم بنا`;

  const {
    data: items,
    isLoading,
    deleteItem,
  } = useCrud({
    queryKey: [activeTab],
    endpoint: `/${activeTab}`,
  });

  const getContactColumns = () => [
    { key: "name", label: "الاسم" },
    {
      key: "email",
      label: "البريد الإلكتروني",
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${email}?subject=استفسار عن حجز الطيران&body=${encodeURIComponent(message)}`}
            className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700"
          >
            <MdEmail />
          </a>
          {email}
        </div>
      ),
    },
    {
      key: "phone", label: "الهاتف", render: (phone: string) => (
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
          >
            <PiWhatsappLogoDuotone />
          </a>
          {phone}
        </div>
      )
    },
    {
      key: "message",
      label: "الرسالة",
      render: (msg: string) => (
        <div className="flex items-center gap-2 max-w-md">
          <p className="truncate flex-1">{msg}</p>
          <button onClick={() => setPreviewMessage(msg)} className="text-primary hover:text-primary/80">
            <FaEye />
          </button>
        </div>
      ),
    },

    { key: "actions", label: "الإجراءات" },
  ];

  const getBookingColumns = () => [
    {
      key: "fromCity",
      label: "من",
    },
    {
      key: "toCity",
      label: "إلى",
    },
    {
      key: "departureDate",
      label: "تاريخ المغادرة",
      render: (date: string) => (
        <div className="flex items-center gap-2 text-sm">
          <FaPlaneDeparture className="text-purple-500" />
          {new Date(date).toLocaleDateString("ar-EG")}
        </div>
      ),
    },
    {
      key: "returnDate",
      label: "تاريخ العودة",
      render: (date: string) => (
        <div className="flex items-center gap-2 text-sm">
          <FaPlaneArrival className="text-purple-500" />
          {new Date(date).toLocaleDateString("ar-EG")}
        </div>
      ),
    },
    {
      key: "passengers",
      label: "الركاب",
      render: (count: number) => (
        <div className="flex items-center gap-2 text-sm">
          <FaPeopleGroup className="text-orange-500" /> {count}
        </div>
      ),
    },
    {
      key: "email", label: "البريد الإلكتروني",
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${email}?subject=استفسار عن حجز الطيران&body=${encodeURIComponent(message)}`}
            className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700"
          >
            <MdEmail />
          </a>
          {email}
        </div>
      ),
    },
    {
      key: "phone", label: "رقم الهاتف",
      render: (phone: string) => (
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
          >
            <PiWhatsappLogoDuotone />
          </a>
          {phone}
        </div>
      ),
    },
    { key: "actions", label: "الإجراءات" },
  ];

  if (isLoading) return <Spinner />;

  return (
    <>
      <PageHeader
        pageName="إدارة الرسائل والحجوزات"
        pageDescription="عرض وحذف رسائل التواصل وحجوزات الطيران"
        PageIcon={activeTab === "contact" ? FaEnvelope : FaPlane}
      />

      <div className="my-6">
        <BreadCrumb breadCrumbItems="رسائل وحجوزات" />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title={activeTab === "contact" ? "رسائل التواصل" : "حجوزات الطيران"}
          action={null}
        />
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium text-sm transition-all ${activeTab === "contact"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("contact")}
          >
            <div className="flex items-center gap-2">
              <FaEnvelope /> رسائل التواصل
            </div>
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-all ${activeTab === "flight-bookings"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("flight-bookings")}
          >
            <div className="flex items-center gap-2">
              <FaPlane /> حجوزات الطيران
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <DataTable
          data={items || []}
          columns={activeTab === "contact" ? getContactColumns() : getBookingColumns()}
          onDelete={(id) => {
            deleteItem(`/${activeTab}/admin/${id}`);
          }}
        />
      </div>

      {previewMessage && (
        <Modal isOpen={!!previewMessage} onClose={() => setPreviewMessage(null)}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaEnvelope className="text-primary" /> معاينة الرسالة
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {previewMessage}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
