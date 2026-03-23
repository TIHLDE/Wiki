"use client";

import clsx from "clsx";
import React from "react";

export type OrgNode = {
  name: string;
  slug?: string;
  image?: string;
};

export type CategoryLevel = {
  name: string;
  children: OrgNode[];
  singleColumn?: boolean;
  twoColumns?: boolean;
  sublevels?: Array<{
    name: string;
    children: OrgNode[];
    singleColumn?: boolean;
    twoColumns?: boolean;
  }>;
};

export type OrgChartData = {
  topRow: OrgNode[];
  levels: CategoryLevel[];
};

const LINE_BG = "bg-zinc-300 dark:bg-zinc-600";

function NodeCard({ node }: { node: OrgNode }) {
  const classes = clsx(
    "inline-flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm",
    "transition-shadow hover:shadow-md",
    "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
    // Keep all group cards visually aligned with the widest one (currently Forvaltningsgruppen)
    "w-[10rem]",
  );

  const content = (
    <>
      {node.image && (
        <img
          src={node.image}
          alt=""
          className="size-8 rounded object-cover"
        />
      )}
      <span className="text-center leading-tight w-full whitespace-normal break-words">
        {node.name}
      </span>
    </>
  );

  if (node.slug) {
    return (
      <a
        href={`https://tihlde.org/grupper/${node.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(classes, "no-underline hover:no-underline")}
      >
        {content}
      </a>
    );
  }

  return <div className={classes}>{content}</div>;
}

function CategoryLabel({ name }: { name: string }) {
  return (
    <div className="inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
      {name}
    </div>
  );
}

function VerticalLine() {
  return <div className={clsx("w-0.5 h-5 shrink-0", LINE_BG)} />;
}

function VerticalLineFull() {
  return <div className={clsx("w-0.5 h-8 shrink-0", LINE_BG)} />;
}

function HorizontalLine() {
  return <div className={clsx("h-0.5 w-8 shrink-0 hidden sm:block", LINE_BG)} />;
}

function BranchConnector({
  children,
  weights,
  stackOnMobile,
}: {
  children: React.ReactNode;
  weights?: number[];
  stackOnMobile?: boolean;
}) {
  const items = React.Children.toArray(children);
  if (items.length <= 1) {
    return (
      <>
        {items.length === 1 && (
          <>
            <VerticalLineFull />
            {items[0]}
          </>
        )}
      </>
    );
  }
  return (
    <>
      <VerticalLineFull />
      <div
        className={clsx(
          "flex items-start",
          stackOnMobile && "flex-col items-center sm:flex-row sm:items-start",
        )}
      >
        {items.map((child, i) => (
          <React.Fragment key={i}>
            {stackOnMobile && i > 0 && (
              <div
                className={clsx("w-0.5 h-8 shrink-0 sm:hidden", LINE_BG)}
              />
            )}
            <div
              className="flex flex-col items-center"
              style={{ flex: weights?.[i] ?? 1 }}
            >
              <div
                className={clsx(
                  "self-stretch flex",
                  stackOnMobile && "hidden sm:flex",
                )}
              >
                <div
                  className={clsx("flex-1 h-0.5", i === 0 ? "" : LINE_BG)}
                />
                <div
                  className={clsx(
                    "flex-1 h-0.5",
                    i === items.length - 1 ? "" : LINE_BG,
                  )}
                />
              </div>
              <div
                className={clsx(
                  "w-0.5 h-4 shrink-0",
                  stackOnMobile && "hidden sm:block",
                  LINE_BG,
                )}
              />
              {child}
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function TopRow({ nodes }: { nodes: OrgNode[] }) {
  return (
    <div className="relative flex flex-col sm:flex-row items-center">
      <div
        className={clsx(
          "absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5",
          LINE_BG,
        )}
      />
      {nodes.map((node, i) => (
        <div
          key={node.slug ?? node.name}
          className="relative flex flex-col sm:flex-row items-center"
        >
          {i > 0 && (
            <>
              <HorizontalLine />
              <div className={clsx("w-0.5 h-5 shrink-0 sm:hidden", LINE_BG)} />
            </>
          )}
          <NodeCard node={node} />
        </div>
      ))}
    </div>
  );
}

function Level({ level }: { level: CategoryLevel }) {
  const renderChildren = ({
    children,
    singleColumn,
    twoColumns,
  }: {
    children: OrgNode[];
    singleColumn?: boolean;
    twoColumns?: boolean;
  }) => (
    <>
      {children.length > 0 && (
        <>
          <VerticalLineFull />
          <div
            className={clsx(
              "gap-1.5",
              singleColumn
                ? "flex-col items-center"
                : twoColumns
                  ? "grid grid-cols-1 sm:grid-cols-2 justify-items-center"
                  : "flex flex-wrap justify-center max-w-[calc(100vw-3rem)] sm:max-w-lg",
              !twoColumns && "flex",
            )}
          >
            {children.map((node) => (
              <NodeCard key={node.slug ?? node.name} node={node} />
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="flex flex-col items-center">
      <CategoryLabel name={level.name} />
      {level.sublevels && level.sublevels.length > 0 ? (
        <BranchConnector stackOnMobile>
          {level.sublevels.map((sublevel) => (
            <div key={sublevel.name} className="flex flex-col items-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                {sublevel.name}
              </div>
              {renderChildren(sublevel)}
            </div>
          ))}
        </BranchConnector>
      ) : (
        renderChildren(level)
      )}
    </div>
  );
}

export function OrgChartTree({ data }: { data: OrgChartData }) {
  const verticalLevels = data.levels.slice(0, 2);
  const sideBySideLevels = data.levels.slice(2);

  return (
    <div className="not-prose max-w-none overflow-x-auto py-6 px-0">
      <div className="flex flex-col items-center min-w-full">
        <CategoryLabel name="Hovedorgan" />
        <VerticalLineFull />
        <TopRow nodes={data.topRow} />
        {verticalLevels.map((level) => (
          <React.Fragment key={level.name}>
            <VerticalLineFull />
            <Level level={level} />
          </React.Fragment>
        ))}
        {sideBySideLevels.length > 0 && (
          <BranchConnector weights={[2, 8]}>
            {sideBySideLevels.map((level) => (
              <Level key={level.name} level={level} />
            ))}
          </BranchConnector>
        )}
      </div>
    </div>
  );
}
