import React from 'react';

interface HubItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface HubPageProps {
  title: string;
  description: string;
  items: HubItem[];
  basePath: string;
}

const HubPage: React.FC<HubPageProps> = ({ title, description, items, basePath }) => {
  return (
    <div className="space-y-12">
      <header className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
          {title}
        </h1>
        <p className="text-gray-400 mt-4 text-lg">{description}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <a
            key={item.id}
            href={`/${basePath}/${item.id}`}
            className="group p-8 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-pink-500/50 hover:bg-gray-800 transition-all flex flex-col items-start"
          >
            <div className="bg-gray-900/50 p-4 rounded-lg text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all mb-4">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-100 group-hover:text-white mb-2">{item.label}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{item.description}</p>
            <span className="mt-auto text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Launch Tool &rarr;
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default HubPage;
