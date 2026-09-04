"use client";
import { FileSearch, ShieldAlert, Waypoints } from "lucide-react";
import ThreeDCard from "@/components/ui/three-d-card";
const steps = [
  {
    icon: FileSearch,
    number: "01",
    title: "Connect the context",
    copy: "Choose a repository. DevAudit uses narrow, read-only GitHub access and builds a map of your source, manifests, and lock files.",
  },
  {
    icon: Waypoints,
    number: "02",
    title: "Trace the blast radius",
    copy: "We follow each dependency and its version back through the repository, then match it with security, licensing, and maintenance signals.",
  },
  {
    icon: ShieldAlert,
    number: "03",
    title: "Ship with evidence",
    copy: "Receive a prioritized report that tells your team exactly what changed, why it matters, and where to start.",
  },
];
// export default function Pipeline() {
//   return (
//     <section className="section shell" id="workflow">
//   <div className="section-intro">
//     <p className="eyebrow">A calmer security workflow</p>
//     <h2>
//       From repository to
//       <br />
//       <em>release confidence.</em>
//     </h2>
//     <p>
//       Security work should reduce uncertainty, not create another dashboard
//       to babysit.
//     </p>
//   </div>
//   <div className="workflow-grid">
// {steps.map(({ icon: Icon, number, title, copy }) => (
//   <ThreeDCard className="workflow-card" key={number}>
//     <div className="card-top">
//       <span>{number}</span>
//       <Icon size={20} />
//     </div>
//     <h3>{title}</h3>
//     <p>{copy}</p>
//   </ThreeDCard>
// ))}
//   </div>
//     </section>
//   );
// }

import React from "react";
import { TracingBeam } from "./ui/tracing-beam";

export function Pipeline() {
  return (
    <div className="section shell" id="workflow">
      <div className="section-intro">
        <h2>
          From repository to
          <br />
          <em>release confidence.</em>
        </h2>
        <p>
          Security work should reduce uncertainty, not create another dashboard
          to babysit.
        </p>
      </div>
      <TracingBeam className="px-6">
        <div className="max-w-2xl mx-auto antialiased pt-4 relative">
          {dummyContent.map((item, index) => (
            <div key={`content-${index}`} className="mb-10">
              <h2 className="bg-black text-white rounded-full text-md w-fit px-4 py-1 mb-4">
                {item.badge}
              </h2>

              <p className="text-xl mb-4">{item.title}</p>

              <div className="text-md prose prose-sm dark:prose-invert">
                {item?.image && (
                  <img
                    src={item.image}
                    alt="blog thumbnail"
                    height="1000"
                    width="1000"
                    className="rounded-lg mb-10 object-cover border border-amber-400/40"
                  />
                )}

                {item.description}
              </div>
            </div>
          ))}
        </div>
      </TracingBeam>
    </div>
  );
}

const dummyContent = [
  {
    title: "Connect the context",
    description: (
      <>
        <p>
          Choose a repository. DevAudit uses narrow, read-only GitHub access and
          builds a map of your source, manifests, and lock files.
        </p>
      </>
    ),
    badge: "01",
    image: "/step1.png",
  },
  {
    title: "Trace the blast radius",
    description: (
      <>
        <p>
          We follow each dependency and its version back through the repository,
          then match it with security, licensing, and maintenance signals.
        </p>
      </>
    ),
    badge: "02",
    image: "/step2.png",
  },
  {
    title: "Ship with evidence",
    description: (
      <>
        <p>
          Receive a prioritized report that tells your team exactly what
          changed, why it matters, and where to start.
        </p>
      </>
    ),
    badge: "03",
    image: "/step3.png",
  },
];
