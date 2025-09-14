import { NetworkNode } from '../interface/graph';

export const nodes: NetworkNode[] = [
  {
    id: 'client',
    label: 'Loremipsumm',
    type: 'client',
    description: 'Frontend application handling user interactions',
    status: 'Active',
    iconUrl: 'graph/1.svg',
    details: { version: '2.1.0', uptime: '99.9%' },
    hoverCardHtml: `
  <div class="font-inter w-full block">
        <div class="rounded-md bg-red-50 px-4 py-1 mb-2">
          <span class="font-bold text-red-600">Lorem Ipsum Dolor Sit</span>
        </div>

        <div class="flex justify-end gap-1 mb-1 mr-4">
          <span class="font-bold bg-red-50 p-1 rounded-md text-red-600">1.2.3.4</span>
          <span class="font-bold bg-red-50 p-1 rounded-md text-red-600">1.2.3.4</span>
          <span class="font-bold bg-red-50 p-1 rounded-md text-red-600">1.2.3.4</span>
        </div>
        <div class="flex mr-4 gap-1 justify-end">
          <span class="font-bold bg-red-50 p-1 rounded-md text-red-600">1.2.3.4</span>
          <span class="font-bold bg-red-50 p-1 rounded-md text-red-600">1.2.3.4</span>
          <span class="font-bold bg-red-50 p-1 rounded-md text-red-600">1.2.3.4</span>
        </div>

        <div class="rounded-md bg-indigo-50 px-4 py-1 mt-4 inline-block">
          <span class="font-bold text-indigo-700">Lorem:
            <span> 1.2.3.4</span>
          </span>
        </div>
      </div>
    `,
  },
  {
    id: 'api',
    label: 'Loremipsu',
    type: 'server',
    description: 'Main API server handling business logic',
    status: 'Healthy',
    iconUrl: 'graph/2.svg',
    details: { cpu: '45%', memory: '68%', requests: '1.2k/min' },
    hoverCardHtml: `<div class="font-inter w-96">
        <div class="flex align-center gap-2 mb-2">
          <span class="inline-flex items-center p-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <span class="material-icons-outlined">dns</span>
          </span>
          <span class="text-gray-500 font-semibold flex items-center">Loremipsu</span>
        </div>
        <div class="flex font-bold mb-2">
          <span class="material-icons-outlined text-gray-400 mr-2 whitespace-nowrap">article</span>
          <span class="text-gray-500 whitespace-nowrap">Lorem: Loremipsum Loremipsum</span>
          <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 rounded whitespace-nowrap">1.2.3.4</span>
        </div>
        
        <div class="flex font-bold">
        <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 rounded whitespace-nowrap">1.2.3.4</span>
          <span class="text-gray-500 whitespace-nowrap">Lorem: Loremipsum Loremipsum</span>
          <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 rounded whitespace-nowrap">1.2.3.4</span>
        </div>
      </div>`,
  },
  {
    id: 'db',
    label: 'Loremipsu',
    type: 'database',
    hasWarning: true,
    description: 'Primary PostgreSQL database',
    status: 'Warning - High Load',
    iconUrl: 'graph/2.svg',
    details: { connections: '95/100', size: '2.3TB' },
    hoverCardHtml: `<div class="font-inter w-96">
        <div class="flex align-center gap-2 mb-2">
          <span class="inline-flex items-center p-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <span class="material-icons-outlined">dns</span>
          </span>
          <span class="text-gray-500 font-semibold flex items-center">Loremipsu</span>
        </div>
        <div class="flex font-bold mb-2">
          <span class="material-icons-outlined text-gray-400 mr-2 whitespace-nowrap">article</span>
          <span class="text-gray-500 whitespace-nowrap">Lorem: Loremipsum Loremipsum</span>
          <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 rounded whitespace-nowrap">1.2.3.4</span>
        </div>
        
        <div class="flex font-bold">
        <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 rounded whitespace-nowrap">1.2.3.4</span>
          <span class="text-gray-500 whitespace-nowrap">Lorem: Loremipsum Loremipsum</span>
          <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 rounded whitespace-nowrap">1.2.3.4</span>
        </div>
      </div>`,
  },
  {
    id: 'compound1',
    label: 'Cluster Node',
    type: 'server',
    children: [
      {
        id: 'nodeA',
        label: 'Loremipsumdolorsit',
        type: 'server',
        sublabel: '192.168.1.1',
        status: 'Active',
        iconUrl: 'graph/2_alt.svg',
        details: { cpu: '30%', memory: '60%' },
        hoverCardHtml: `
          <div class="font-inter">
            <div class="flex align-center gap-2 mb-2">
              <span class="inline-flex items-center p-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <span class="material-icons-outlined">dns</span>
              </span>
              <span class="flex flex-col">
                <span class="text-gray-500 font-semibold flex items-center">Loremipsumdolorsit</span>
                <span class="text-xs text-gray-400">192.168.1.1</span>
              </span>            
              </div>
            <div class="flex font-bold mb-2">
              <span class="material-icons-outlined text-gray-400 mr-2 whitespace-nowrap">article</span>
              <span class="text-gray-500 whitespace-nowrap">Lorem: <span class="bg-yellow-50 text-yellow-500">Lorem "Lorem"</span></span>
            </div>

            <div class="flex font-bold">
              <span class="text-gray-500 whitespace-nowrap">Loremipsum</span>
              <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 bg-blue-50 rounded whitespace-nowrap">Lorem 1234,567</span>
            </div>
          </div>`,
      },
      {
        id: 'nodeB',
        label: 'Loremipsumdolorsit002',
        type: 'database',
        sublabel: '192.168.1.2',
        status: 'Active',
        iconUrl: 'graph/2_alt.svg',
        details: { size: '1.1TB', connections: '50/100' },
        hoverCardHtml: `
          <div class="font-inter">
            <div class="flex align-center gap-2 mb-2">
              <span class="inline-flex items-center p-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <span class="material-icons-outlined">dns</span>
              </span>
              <span class="flex flex-col">
                <span class="text-gray-500 font-semibold flex items-center">Loremipsumdolorsit</span>
                <span class="text-xs text-gray-400">192.168.1.2</span>
              </span>            
              </div>
            <div class="flex font-bold mb-2">
              <span class="material-icons-outlined text-gray-400 mr-2 whitespace-nowrap">article</span>
              <span class="text-gray-500 whitespace-nowrap">Lorem: <span class="bg-yellow-50 text-yellow-500">Lorem "Lorem"</span></span>
            </div>

            <div class="flex font-bold">
              <span class="text-gray-500 whitespace-nowrap">Loremipsum</span>
              <span class="bg-voilet-50 text-blue-700 ml-2 px-2.5 bg-blue-50 rounded whitespace-nowrap">Lorem 1234,567</span>
            </div>
          </div>`,
      },
    ],
    description: 'Cluster node with two elements',
    status: 'Active',
    iconUrl: 'assets/server.png',
  },
];
