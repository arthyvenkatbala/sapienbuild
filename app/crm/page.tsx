"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserCheck, Briefcase, ChevronRight, Mail, Phone, ArrowRight } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  enquiry:         "Enquiry",
  discussion:      "Discussion",
  quote:           "Quote",
  negotiation:     "Negotiation",
  booked:          "Booked",
  execution:       "Execution",
  feedback:        "Feedback",
  post_production: "Post Production",
  delivery:        "Delivery",
};

const STAGE_COLORS: Record<string, string> = {
  enquiry:         "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  discussion:      "bg-purple-500/20 text-purple-400 border-purple-500/30",
  quote:           "bg-amber-500/20 text-amber-400 border-amber-500/30",
  negotiation:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  booked:          "bg-green-500/20 text-green-400 border-green-500/30",
  execution:       "bg-blue-500/20 text-blue-400 border-blue-500/30",
  feedback:        "bg-pink-500/20 text-pink-400 border-pink-500/30",
  post_production: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  delivery:        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

interface Contact {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  stage: string | null;
  source: string | null;
  status: string;
  created_at: string;
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ContactRow({ contact, showStage }: { contact: Contact; showStage?: boolean }) {
  const fullName = `${contact.first_name} ${contact.last_name}`.trim();
  const colors = ["bg-teal-500/20 text-teal-400", "bg-purple-500/20 text-purple-400", "bg-amber-500/20 text-amber-400", "bg-blue-500/20 text-blue-400", "bg-pink-500/20 text-pink-400"];
  const color = colors[fullName.charCodeAt(0) % colors.length];

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <Avatar name={contact.first_name} color={color} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 truncate">{fullName}</p>
        <p className="text-xs text-zinc-600 truncate">{contact.email ?? contact.phone ?? "—"}</p>
      </div>
      {showStage && contact.stage && (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${STAGE_COLORS[contact.stage] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
          {STAGE_LABELS[contact.stage] ?? contact.stage}
        </span>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  color,
  contacts,
  href,
  showStage,
  loading,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  contacts: Contact[];
  href: string;
  showStage?: boolean;
  loading: boolean;
}) {
  return (
    <div className="bg-[#111114] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon size={14} />
          </div>
          <span className="text-sm font-medium text-white">{title}</span>
          {!loading && (
            <span className="text-xs text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded-full">
              {contacts.length}
            </span>
          )}
        </div>
        <Link href={href} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/[0.04] rounded animate-pulse w-32" />
                  <div className="h-2.5 bg-white/[0.04] rounded animate-pulse w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-6">No {title.toLowerCase()} yet</p>
        ) : (
          <div>
            {contacts.slice(0, 6).map((c) => (
              <ContactRow key={c.id} contact={c} showStage={showStage} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CRMOverviewPage() {
  const [leads, setLeads] = useState<Contact[]>([]);
  const [clients, setClients] = useState<Contact[]>([]);
  const [team, setTeam] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts?type=lead").then((r) => r.json()),
      fetch("/api/contacts?type=client").then((r) => r.json()),
      fetch("/api/contacts?type=contractor").then((r) => r.json()),
    ]).then(([l, c, t]) => {
      setLeads(l.contacts ?? []);
      setClients(c.contacts ?? []);
      setTeam(t.contacts ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Leads",   value: leads.length,   icon: Users,      color: "bg-teal-500/10 text-teal-400",   href: "/crm/leads" },
    { label: "Total Clients", value: clients.length, icon: UserCheck,  color: "bg-purple-500/10 text-purple-400", href: "/crm/clients" },
    { label: "Team Members",  value: team.length,    icon: Briefcase,  color: "bg-amber-500/10 text-amber-400",  href: "/crm/team" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0d] p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">CRM</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Overview of leads, clients, and team</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="bg-[#111114] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4 hover:border-white/[0.12] transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {loading ? <span className="inline-block w-8 h-6 bg-white/[0.06] rounded animate-pulse" /> : s.value}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
              <ChevronRight size={14} className="ml-auto text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Three panels */}
      <div className="grid grid-cols-3 gap-4">
        <Section title="Leads"   icon={Users}     color="bg-teal-500/10 text-teal-400"    contacts={leads}   href="/crm/leads"   showStage loading={loading} />
        <Section title="Clients" icon={UserCheck}  color="bg-purple-500/10 text-purple-400" contacts={clients} href="/crm/clients" showStage loading={loading} />
        <Section title="Team"    icon={Briefcase}  color="bg-amber-500/10 text-amber-400"   contacts={team}    href="/crm/team"             loading={loading} />
      </div>
    </div>
  );
}
