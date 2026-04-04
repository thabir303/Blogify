import React from 'react';

const Preview = ({ title = 'Untitled', content = '' }) => {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="whitespace-pre-wrap leading-7 text-slate-700">{content}</p>
    </article>
  );
};

export default Preview;
