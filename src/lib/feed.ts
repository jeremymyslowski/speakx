export type DemoPost = {
  id: string;
  name: string;
  handle: string;
  time: string;
  text: string;
  replies: number;
  reposts: number;
  likes: number;
  views: string;
  initials: string;
  tone: "slate" | "stone" | "olive" | "steel" | "dusk";
  verified?: boolean;
  threadRest?: string[];
};

export const DEMO_POSTS: DemoPost[] = [
  {
    id: "p1",
    name: "Mira Chen",
    handle: "mira",
    time: "12m",
    initials: "MC",
    tone: "steel",
    verified: true,
    text: "The best writing advice I ever got: read the sentence out loud. If you stumble, the reader will too. Turns out this also works for product copy, legal disclaimers, and every Slack message you will later regret.",
    replies: 48,
    reposts: 312,
    likes: 4200,
    views: "186K",
  },
  {
    id: "p2",
    name: "Northline Journal",
    handle: "northline",
    time: "28m",
    initials: "NJ",
    tone: "olive",
    verified: true,
    text: "Morning briefing. Lisbon hit 34°C before noon. Tokyo's night trains ran on time for the 2,000th consecutive day. A research group in Lund published a paper on why we remember voices longer than faces. The timeline will move on. The voice will not.",
    replies: 19,
    reposts: 88,
    likes: 964,
    views: "41K",
  },
  {
    id: "p3",
    name: "Jules Okonkwo",
    handle: "julesok",
    time: "1h",
    initials: "JO",
    tone: "dusk",
    text: "Hot take that is actually lukewarm: most 'productivity systems' are just a way to avoid starting the thing. Start the thing. Then, if you must, buy the notebook.",
    replies: 203,
    reposts: 1100,
    likes: 8900,
    views: "502K",
    threadRest: [
      "The notebook is not the work. The calendar is not the work. The beautifully labeled folders are not the work.",
      "I say this as a person with three notebooks, two calendars, and a folder named 'finally'. The work is still waiting.",
    ],
  },
  {
    id: "p4",
    name: "Atlas Weather",
    handle: "atlaswx",
    time: "2h",
    initials: "AW",
    tone: "slate",
    text: "A low is sliding off the Pacific. If you are on the coast tonight, the wind will arrive before the rain. Close the west windows. The east ones can stay.",
    replies: 11,
    reposts: 40,
    likes: 508,
    views: "22K",
  },
  {
    id: "p5",
    name: "Orbit Labs",
    handle: "orbitlabs",
    time: "3h",
    initials: "OL",
    tone: "stone",
    verified: true,
    text: "We spent four years teaching machines to talk. Almost nobody asked whether we wanted them to listen. The more interesting problem is the reverse: taking the firehose of public language and making it something a person can actually hear, at walking speed, without a screen.",
    replies: 76,
    reposts: 441,
    likes: 3100,
    views: "97K",
  },
  {
    id: "p6",
    name: "Rae Voss",
    handle: "raevoss",
    time: "5h",
    initials: "RV",
    tone: "olive",
    text: "Restaurant order, dictated from a moving tram: two coffees, one without milk, a cinnamon bun if they still have the good ones, and please do not call it a croissant if it is not a croissant. Thank you.",
    replies: 6,
    reposts: 9,
    likes: 142,
    views: "8.1K",
  },
  {
    id: "p7",
    name: "Field Notes",
    handle: "fieldnotes",
    time: "7h",
    initials: "FN",
    tone: "steel",
    text: "A city is a library you walk through. Street names are the index. Cafés are the marginalia. The river is the one book nobody finishes. Today I walked until the page numbers stopped making sense, which is to say: I got lost on purpose.",
    replies: 33,
    reposts: 190,
    likes: 2700,
    views: "64K",
  },
  {
    id: "p8",
    name: "Kenzo Mori",
    handle: "kenzomori",
    time: "9h",
    initials: "KM",
    tone: "dusk",
    verified: true,
    text: "Shipped the quiet version. No launch thread. No countdown. If you need it, it is there. If you do not, your timeline will be slightly less noisy, which is also a kind of feature.",
    replies: 54,
    reposts: 220,
    likes: 1800,
    views: "73K",
  },
];

export const TONE_CLASS: Record<DemoPost["tone"], string> = {
  slate: "bg-[#2a2d33] text-[#d5d8de]",
  stone: "bg-[#322c28] text-[#e6d7c8]",
  olive: "bg-[#2a3028] text-[#d4ddc8]",
  steel: "bg-[#243038] text-[#d2e2ea]",
  dusk: "bg-[#30242c] text-[#e6d0da]",
};
