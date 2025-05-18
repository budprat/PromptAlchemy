import { useState } from "react";
import { Tab } from "@headlessui/react";
import { cn } from "@/lib/utils";
import PromptEvaluationForm from "@/components/prompts/PromptEvaluationForm";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PromptEvaluation() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const tabs = [
    { name: 'Evaluate New Prompt', content: <PromptEvaluationForm /> },
    { name: 'Comparison', content: <ComingSoon feature="Prompt Comparison" /> },
    { name: 'History', content: <ComingSoon feature="Evaluation History" /> },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Prompt Evaluation</h2>
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="border-b border-slate-200">
            <div className="flex">
              {tabs.map((tab, idx) => (
                <Tab
                  key={idx}
                  className={({ selected }) =>
                    classNames(
                      'px-4 py-3 text-sm font-medium focus:outline-none',
                      selected
                        ? 'border-b-2 border-primary-500 text-primary-700'
                        : 'text-slate-500 hover:text-slate-700'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </div>
          </Tab.List>
          <Tab.Panels className="p-4">
            {tabs.map((tab, idx) => (
              <Tab.Panel key={idx}>
                {tab.content}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="py-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
        <i className="ri-rocket-line text-2xl text-primary-600"></i>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">{feature} Coming Soon</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        We're working hard to bring you this feature. Stay tuned for updates!
      </p>
    </div>
  );
}
