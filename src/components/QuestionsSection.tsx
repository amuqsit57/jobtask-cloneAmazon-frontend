'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { askQuestion, answerQuestion } from '@/lib/api';
import type { Question } from '@/lib/types';

export function QuestionsSection({
  productId,
  initial,
}: {
  productId: number;
  initial: Question[];
}) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState(initial);
  const [asking, setAsking] = useState(false);
  const [draft, setDraft] = useState('');
  const [answerFor, setAnswerFor] = useState<number | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitQuestion() {
    if (!session?.apiToken) return;
    setBusy(true);
    setError(null);
    try {
      const { question } = await askQuestion(productId, draft, session.apiToken);
      setQuestions([{ ...question, answers: [] }, ...questions]);
      setDraft('');
      setAsking(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post your question');
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(qid: number) {
    if (!session?.apiToken) return;
    setBusy(true);
    try {
      await answerQuestion(qid, answerDraft, session.apiToken);
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === qid
            ? {
                ...q,
                answers: [
                  ...q.answers,
                  {
                    id: Date.now(),
                    author: session.user?.name ?? 'You',
                    body: answerDraft,
                    votes: 0,
                  },
                ],
              }
            : q
        )
      );
      setAnswerDraft('');
      setAnswerFor(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="questions" className="mt-8 border-t border-gray-200 pt-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[21px] font-bold">Customer questions &amp; answers</h2>
        {session ? (
          <button onClick={() => setAsking(!asking)} className="btn-secondary">
            Ask a question
          </button>
        ) : (
          <Link href="/signin" className="text-[13px] link-amazon">
            Sign in to ask a question
          </Link>
        )}
      </div>

      {asking && (
        <div className="mb-5 rounded-lg border border-[var(--color-border-grey)] p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="What would you like to know about this product?"
            className="input-amazon mb-2 resize-y"
          />
          {error && <p className="mb-2 text-[13px] text-[#c40000]">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={submitQuestion}
              disabled={busy || draft.trim().length < 5}
              className="btn-amazon"
            >
              {busy ? 'Posting…' : 'Post question'}
            </button>
            <button onClick={() => setAsking(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-[14px] text-[var(--color-text-secondary)]">
          No questions yet. Be the first to ask.
        </p>
      ) : (
        <ul className="space-y-5">
          {questions.map((q) => (
            <li key={q.id} className="border-b border-gray-100 pb-4">
              <div className="flex gap-3">
                <div className="w-16 shrink-0 text-right text-[13px] text-[var(--color-text-secondary)]">
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {q.votes}
                  </span>
                  <br />
                  votes
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold">Q: {q.body}</p>

                  {q.answers.map((a) => (
                    <p key={a.id} className="mt-1.5 text-[14px] leading-5">
                      <span className="font-bold">A:</span> {a.body}{' '}
                      <span className="text-[12px] text-[var(--color-text-secondary)]">
                        — {a.author}
                      </span>
                    </p>
                  ))}

                  {q.answers.length === 0 && (
                    <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                      No answers yet.
                    </p>
                  )}

                  {session && answerFor !== q.id && (
                    <button
                      onClick={() => setAnswerFor(q.id)}
                      className="mt-1.5 text-[13px] link-amazon"
                    >
                      Answer this question
                    </button>
                  )}

                  {answerFor === q.id && (
                    <div className="mt-2">
                      <textarea
                        value={answerDraft}
                        onChange={(e) => setAnswerDraft(e.target.value)}
                        rows={2}
                        placeholder="Share what you know"
                        className="input-amazon mb-2 resize-y"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitAnswer(q.id)}
                          disabled={busy || answerDraft.trim().length < 2}
                          className="btn-amazon"
                        >
                          Post answer
                        </button>
                        <button
                          onClick={() => setAnswerFor(null)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
