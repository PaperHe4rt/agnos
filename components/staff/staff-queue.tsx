"use client";

import { useMemo, useState } from "react";
import {
  formatDateOfBirth,
  getAttentionFlag,
  getStatus,
} from "@/lib/intake/status";
import type { ConnectionState, IntakeSession } from "@/lib/intake/types";
import { ConnectionBanner } from "./connection-status";
import {
  clampPage,
  getPageCount,
  getPageRange,
  paginateItems,
} from "./pagination";
import { PatientCard } from "./patient-card";
import { PatientDetail } from "./patient-detail";
import { QueueTable } from "./queue-table";
import { patientName } from "./summary";

type Filter = "all" | "active" | "submitted" | "inactive" | "needs_help";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "submitted", label: "Submitted" },
  { id: "inactive", label: "Inactive" },
  { id: "needs_help", label: "Needs help" },
];

function matchesFilter(session: IntakeSession, filter: Filter, now: number) {
  if (filter === "all") return true;
  if (filter === "needs_help") return getAttentionFlag(session) !== null;
  return getStatus(session, now) === filter;
}

function matchesQuery(session: IntakeSession, query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const { values } = session;
  const haystack = [
    patientName(values),
    values.middleName,
    values.dateOfBirth,
    values.dateOfBirth ? formatDateOfBirth(values.dateOfBirth) : null,
    values.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes(trimmed)) return true;
  if (/[a-z]/.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, "");
  const phoneDigits = values.phone?.replace(/\D/g, "") ?? "";
  return digits.length >= 3 && phoneDigits.includes(digits);
}

type StaffQueueProps = {
  sessions: IntakeSession[];
  now: number;
  connection: ConnectionState;
};

export function StaffQueue({ sessions, now, connection }: StaffQueueProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dense, setDense] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [frozenOrder, setFrozenOrder] = useState<string[] | null>(null);

  const sorted = useMemo(() => {
    const byActivity = [...sessions].sort(
      (a, b) => b.lastKeystrokeAt - a.lastKeystrokeAt,
    );
    if (!frozenOrder) return byActivity;

    const rank = new Map(frozenOrder.map((id, index) => [id, index]));
    return byActivity.sort(
      (a, b) =>
        (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [sessions, frozenOrder]);

  const shown = sorted.filter(
    (session) =>
      matchesFilter(session, filter, now) && matchesQuery(session, query),
  );
  const pageCount = getPageCount(shown.length);
  const currentPage = clampPage(page, pageCount);
  const pageRange = getPageRange(shown.length, currentPage);
  const visibleSessions = paginateItems(shown, currentPage);

  const selected =
    sessions.find((session) => session.id === selectedId) ?? null;

  return (
    <>
      <div className={selected ? "lg:mr-104" : ""}>
        <div className="flex flex-col gap-4 px-6 py-6 sm:px-10">
          <ConnectionBanner connection={connection} />

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(({ id, label }) => {
                const count = sorted.filter((session) =>
                  matchesFilter(session, id, now),
                ).length;
                const active = filter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setFilter(id);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      active
                        ? "border-accent-strong bg-accent-tint text-accent-strong"
                        : "border-line text-ink-muted hover:bg-accent-tint"
                    }`}
                  >
                    {label}
                    <span className="font-mono text-meta">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 xl:w-72">
                <label htmlFor="queue-search" className="sr-only">
                  Search patients
                </label>
                <input
                  id="queue-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, phone or DOB"
                  className="h-touch w-full rounded-field border border-control bg-surface px-3 text-body text-ink placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
              </div>

              <div
                className="hidden xl:flex"
                role="group"
                aria-label="Queue density"
              >
                <button
                  type="button"
                  aria-pressed={!dense}
                  onClick={() => setDense(false)}
                  className={`h-touch rounded-l-field border border-line px-4 text-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    dense
                      ? "text-ink-muted hover:bg-accent-tint"
                      : "bg-accent-tint text-accent-strong"
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  aria-pressed={dense}
                  onClick={() => setDense(true)}
                  className={`h-touch rounded-r-field border border-l-0 border-line px-4 text-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    dense
                      ? "bg-accent-tint text-accent-strong"
                      : "text-ink-muted hover:bg-accent-tint"
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          <p className="text-meta text-ink-soft">
            {shown.length === 0
              ? "0"
              : `Showing ${pageRange.start}-${pageRange.end}`}{" "}
            of {shown.length} shown · {sessions.length} total · sorted by last
            activity
          </p>

          {shown.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
              <p className="text-question font-semibold">
                {sessions.length === 0
                  ? "No one is filling in right now"
                  : "No patients match this view"}
              </p>
              <p className="mt-2 text-body text-ink-muted">
                {sessions.length === 0
                  ? "New intakes appear here the moment a patient opens their link."
                  : "Clear the search or pick another filter."}
              </p>
            </div>
          ) : (
            <div
              onFocus={() => {
                if (!frozenOrder) setFrozenOrder(sorted.map((s) => s.id));
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setFrozenOrder(null);
              }}
            >
              <div
                className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${dense ? "xl:hidden" : ""}`}
              >
                {visibleSessions.map((session) => (
                  <PatientCard
                    key={session.id}
                    session={session}
                    now={now}
                    selected={session.id === selectedId}
                    onOpen={setSelectedId}
                  />
                ))}
              </div>

              {dense ? (
                <div className="mt-4 hidden xl:block">
                  <QueueTable
                    sessions={visibleSessions}
                    now={now}
                    selectedId={selectedId}
                    onOpen={setSelectedId}
                  />
                </div>
              ) : null}

              {pageCount > 1 ? (
                <nav
                  aria-label="Queue pagination"
                  className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"
                >
                  <p className="font-mono text-meta text-ink-soft">
                    Page {currentPage} of {pageCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                      className="h-touch rounded-field border border-line px-4 text-label font-semibold text-ink-muted hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage(currentPage + 1)}
                      className="h-touch rounded-field border border-line px-4 text-label font-semibold text-ink-muted hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <PatientDetail
          session={selected}
          now={now}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </>
  );
}
