import type { StaticImageData } from "next/image";

import diskit from "../../public/tours/demo/diskit.jpg";
import enfield from "../../public/tours/demo/enfield.jpg";
import kazaLosar from "../../public/tours/demo/kaza-losar.jpg";
import keyMonastery from "../../public/tours/demo/key-monastery.jpg";
import khardungCheckpoint from "../../public/tours/demo/khardung-checkpoint.jpg";
import khardungLa from "../../public/tours/demo/khardung-la.jpg";
import manaliLehRock from "../../public/tours/demo/manali-leh-rock.jpg";
import manaliLeh from "../../public/tours/demo/manali-leh.jpg";
import nubraDunes from "../../public/tours/demo/nubra-dunes.jpg";
import nubra from "../../public/tours/demo/nubra.jpg";
import padumRoad from "../../public/tours/demo/padum-road.jpg";
import pangong from "../../public/tours/demo/pangong.jpg";
import pinValley from "../../public/tours/demo/pin-valley.jpg";
import routeLadakh from "../../public/tours/demo/route-ladakh.jpg";
import routeNepal from "../../public/tours/demo/route-nepal.jpg";
import thiksey from "../../public/tours/demo/thiksey.jpg";
import yak from "../../public/tours/demo/yak.jpg";
import zanskarPeaks from "../../public/tours/demo/zanskar-peaks.jpg";

import { allPackages, type TourPackage } from "./packages";

/**
 * Tour detail pages.
 *
 * DEMO CONTENT. Everything below the type definitions is placeholder copy and
 * placeholder photography, written so the page can be designed and reviewed.
 * It is replaced wholesale when the backend lands, which is why it sits in one
 * file rather than in the message catalogues: none of it is translated yet.
 *
 * The prices, dates, inclusions and itineraries are not real. Do not publish
 * this without replacing them.
 */

/** Keys are looked up in the `tour.facts` message namespace. */
export type FactKey =
  | "location"
  | "weather"
  | "vehicle"
  | "terrain"
  | "distance"
  | "duration"
  | "difficulty"
  | "groupSize";

export type Departure = {
  /** ISO dates. Rendered with the visitor's locale. */
  start: string;
  end: string;
  soldOut?: boolean;
  /** Per person, in USD, converted at render time. */
  solo: number;
  twin: number;
  edition: string;
  direction: string;
  leader: string;
};

export type ProgramDay = {
  day: number;
  title: string;
  stay?: string;
  body: string;
  image: StaticImageData;
};

export type ExpectPanel = {
  key: string;
  tab: string;
  title: string;
  body: string;
  image: StaticImageData;
};

export type TourDetail = {
  slug: string;
  package: TourPackage;
  hero: StaticImageData;
  heroAlt: string;
  /** Sits under the H1 in the hero. */
  lead: string;
  place: { title: string; body: string };
  facts: { key: FactKey; value: string }[];
  departures: Departure[];
  included: string[];
  excluded: string[];
  route: { image: StaticImageData; alt: string };
  program: ProgramDay[];
  expect: ExpectPanel[];
  gallery: { image: StaticImageData; alt: string }[];
};

const pkg = (key: TourPackage["key"]) => {
  const match = allPackages.find((entry) => entry.key === key);
  if (!match) throw new Error(`Unknown tour: ${key}`);
  return match;
};

const ladakhGallery = [
  { image: khardungLa, alt: "The road over Khardung La in Ladakh" },
  { image: pangong, alt: "Pangong Tso stretching towards the Tibetan border" },
  { image: nubraDunes, alt: "Sand dunes and poplars in the Nubra valley" },
  { image: manaliLeh, alt: "The Manali to Leh highway crossing open high country" },
  { image: thiksey, alt: "Thiksey monastery above the Indus valley" },
  { image: enfield, alt: "A motorcycle parked on a Himalayan road" },
  { image: nubra, alt: "The Nubra valley floor between two ranges" },
  { image: manaliLehRock, alt: "Eroded rock formations beside the Manali to Leh highway" },
  { image: diskit, alt: "Diskit monastery on the hillside in Nubra" },
  { image: khardungCheckpoint, alt: "The checkpoint at the top of Khardung La" },
  { image: yak, alt: "A yak grazing on the Changthang plateau" },
  { image: zanskarPeaks, alt: "Peaks above the Tsarap valley in Zanskar" },
  { image: padumRoad, alt: "The road towards Padum in the Zanskar range" },
  { image: keyMonastery, alt: "Key monastery stacked on its hill in Spiti" },
  { image: pinValley, alt: "The Pin valley in Spiti" },
  { image: kazaLosar, alt: "The road between Kaza and Losar in Spiti" },
];

const standardIncluded = [
  "Expedition motorcycle or 4x4 for the full route",
  "Fuel for the expedition vehicle",
  "Third party insurance on the expedition vehicle",
  "Accommodation on a twin sharing basis, unless a single supplement is taken",
  "All meals from the welcome dinner to the farewell dinner",
  "Bottled water and refreshments on the road",
  "Expedition leader and riding guides for the whole route",
  "Mechanic travelling with the group, and spares for the expedition vehicles",
  "Backup vehicle carrying luggage, spares and anyone off the bike",
  "Oxygen and a first aid kit carried at all times",
  "All inner line and restricted area permits",
  "Airport transfers on the first and last day",
];

const standardExcluded = [
  "International and domestic flights",
  "Visas, where your passport requires one",
  "International Driving Permit, which must be issued before you travel",
  "Personal travel insurance covering high altitude, motorcycling and evacuation",
  "Damage excess on the expedition vehicle, and any optional cover for it",
  "Riding gear, helmet and personal clothing",
  "Personal medication",
  "Early check in or late check out either side of the expedition",
  "Alcohol, laundry, tips, phone calls and anything else of a personal nature",
];

export const tourPages: TourDetail[] = [
  {
    slug: "ladakh-motorcycle-tour",
    package: pkg("ladakhMotorcycle"),
    hero: manaliLeh,
    heroAlt: "A motorcycle on the Manali to Leh highway in the Indian Himalayas",
    lead: "Twelve days from Manali to Leh and back out through Nubra and Pangong, over five passes above 5,000 metres, with a mechanic and a backup vehicle the whole way.",
    place: {
      title: "Ladakh: the cold desert on the roof of India",
      body: "Ladakh sits behind the main Himalayan range, in its rain shadow, which is why a place surrounded by the highest mountains on earth looks like a desert. Villages appear where there is meltwater and nowhere else. Between them the road runs for hours through ochre rock and open gravel plain with nothing in it. The passes here are among the highest a vehicle can be driven over anywhere, and the monasteries have been sitting above the Indus for six hundred years. It is not a difficult place to ride. It is a difficult place to ride badly prepared, which is the whole reason this trip is run the way it is.",
    },
    facts: [
      { key: "location", value: "India, Ladakh and Himachal Pradesh" },
      { key: "weather", value: "Max 25°C, min -2°C at altitude" },
      { key: "vehicle", value: "Royal Enfield Himalayan 450 or similar" },
      { key: "terrain", value: "Tarmac, gravel and river crossings" },
      { key: "distance", value: "± 1,800 km" },
      { key: "duration", value: "12 days" },
      { key: "difficulty", value: "Moderate, high altitude throughout" },
      { key: "groupSize", value: "12 riders" },
    ],
    departures: [
      {
        start: "2026-06-13",
        end: "2026-06-24",
        soldOut: true,
        solo: 2850,
        twin: 2150,
        edition: "Signature",
        direction: "Manali to Leh",
        leader: "Tushar",
      },
      {
        start: "2026-07-11",
        end: "2026-07-22",
        solo: 2850,
        twin: 2150,
        edition: "Signature",
        direction: "Manali to Leh",
        leader: "Tushar",
      },
      {
        start: "2026-08-15",
        end: "2026-08-26",
        solo: 2950,
        twin: 2250,
        edition: "Signature",
        direction: "Leh to Manali",
        leader: "Ravi",
      },
      {
        start: "2026-09-05",
        end: "2026-09-16",
        solo: 2850,
        twin: 2150,
        edition: "Photography",
        direction: "Manali to Leh",
        leader: "Ravi",
      },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    route: { image: routeLadakh, alt: "Relief map of Ladakh showing the expedition route" },
    program: [
      {
        day: 1,
        title: "Arrive in Manali",
        stay: "Hotel in Old Manali",
        body: "Fly or drive into Manali. Bike handover, a look over the kit you have brought, and the expedition briefing over dinner.",
        image: manaliLeh,
      },
      {
        day: 2,
        title: "Shakedown ride",
        stay: "Hotel in Old Manali",
        body: "A short loop out of the valley to get used to the machine before the altitude starts. Anything that needs adjusting gets adjusted today.",
        image: enfield,
      },
      {
        day: 3,
        title: "Manali to Jispa",
        stay: "Riverside lodge",
        body: "Over the Atal tunnel into Lahaul and up the Bhaga river. The scenery changes from pine to bare rock inside an hour.",
        image: manaliLehRock,
      },
      {
        day: 4,
        title: "Jispa to Sarchu",
        stay: "Fixed camp",
        body: "Baralacha La at 4,890 metres, then the long open run onto the Sarchu plain. First night properly high, so the day is deliberately short.",
        image: manaliLeh,
      },
      {
        day: 5,
        title: "Sarchu to Leh",
        stay: "Hotel in Leh",
        body: "The Gata Loops, Nakee La, Lachulung La and Taglang La in one day, then down the Indus valley into Leh.",
        image: khardungCheckpoint,
      },
      {
        day: 6,
        title: "Leh, rest and acclimatise",
        stay: "Hotel in Leh",
        body: "No riding. Permits are collected, bikes are checked over, and there is time for Thiksey and Shey if you want them.",
        image: thiksey,
      },
      {
        day: 7,
        title: "Leh to Nubra over Khardung La",
        stay: "Camp in Hunder",
        body: "Up and over Khardung La and down into the Nubra valley, where there are sand dunes at 3,000 metres and Bactrian camels on them.",
        image: khardungLa,
      },
      {
        day: 8,
        title: "Nubra valley",
        stay: "Camp in Hunder",
        body: "A run up the Shyok towards Turtuk, close to the line of control, through villages that only opened to visitors in 2010.",
        image: nubraDunes,
      },
      {
        day: 9,
        title: "Nubra to Pangong Tso",
        stay: "Camp on the lake",
        body: "The Shyok river road east to Pangong. Rough in places, spectacular throughout, and the lake turns three different colours before sunset.",
        image: nubra,
      },
      {
        day: 10,
        title: "Pangong to Hanle",
        stay: "Homestay in Hanle",
        body: "South along the Changthang plateau through nomad country. Yaks, kiangs and almost no traffic.",
        image: yak,
      },
      {
        day: 11,
        title: "Hanle to Tso Moriri",
        stay: "Camp at Korzok",
        body: "High plateau riding to another lake, this one at 4,500 metres with Mentok Kangri behind it.",
        image: pangong,
      },
      {
        day: 12,
        title: "Tso Moriri to Leh, and out",
        stay: "Hotel in Leh",
        body: "Back over the Taglang La into Leh. Bikes handed back, farewell dinner, flights out the following morning.",
        image: diskit,
      },
    ],
    expect: [
      {
        key: "terrain",
        tab: "Terrain",
        title: "What is under the wheels",
        body: "Roughly two thirds sealed road and one third gravel, sand and broken surface. The passes are mostly tarmac now. The Shyok river road, the run into Hanle and the last stretch to Tso Moriri are not, and there are two or three water crossings depending on the season and the time of day.",
        image: manaliLehRock,
      },
      {
        key: "vehicle",
        tab: "The machine",
        title: "What you will be riding",
        body: "Royal Enfield Himalayan 450 as standard, prepared and serviced by our own workshop in Manali before every departure. Larger and smaller options are available on request. Every bike carries a spares kit, and the mechanic rides with the group rather than following in a truck.",
        image: enfield,
      },
      {
        key: "beyond",
        tab: "Off the bike",
        title: "The half of it that is not riding",
        body: "Monasteries at Thiksey and Diskit, an afternoon in Turtuk, nomad camps on the Changthang, and a lot of time simply sitting somewhere very high and very quiet. The schedule has slack in it on purpose, and the slack is where most of this happens.",
        image: thiksey,
      },
      {
        key: "comforts",
        tab: "Where you sleep",
        title: "Comfort where there is any to be had",
        body: "Hotels in Manali and Leh, lodges in the valleys, and fixed camps with proper beds and hot water where a valley has nothing else. Nubra, Pangong and Tso Moriri are camps because there is no alternative at that altitude, not because it is more rugged.",
        image: pangong,
      },
    ],
    gallery: ladakhGallery,
  },

  {
    slug: "indian-himalayas-4x4-adventure-expedition",
    package: pkg("himalayas4x4"),
    hero: kazaLosar,
    heroAlt: "A road through the Spiti valley in the Indian Himalayas",
    lead: "Fourteen days at the wheel of your own 4x4 through Spiti and Ladakh, on the roads a motorcycle group takes but with a roof, a heater and room for the camera bag.",
    place: {
      title: "Spiti and Ladakh: two cold deserts, one road between them",
      body: "Spiti is the quieter half of this. A narrow valley with a river the colour of milk, monasteries stacked on hilltops, and villages that spend six months of the year cut off. North of it Ladakh opens out into something much bigger and emptier. Driving the two back to back means watching the landscape lose its vegetation a little more each day until there is nothing left but rock, sky and the road. Self drive means you set your own pace inside the day, which in country this big matters more than it sounds.",
    },
    facts: [
      { key: "location", value: "India, Himachal Pradesh and Ladakh" },
      { key: "weather", value: "Max 24°C, min -4°C at altitude" },
      { key: "vehicle", value: "Mahindra Thar 4x4 or similar" },
      { key: "terrain", value: "Tarmac, gravel and water crossings" },
      { key: "distance", value: "± 2,200 km" },
      { key: "duration", value: "14 days" },
      { key: "difficulty", value: "Moderate, high altitude throughout" },
      { key: "groupSize", value: "8 vehicles" },
    ],
    departures: [
      {
        start: "2026-06-20",
        end: "2026-07-03",
        solo: 3200,
        twin: 2400,
        edition: "Signature",
        direction: "Shimla to Leh",
        leader: "Ravi",
      },
      {
        start: "2026-08-01",
        end: "2026-08-14",
        soldOut: true,
        solo: 3200,
        twin: 2400,
        edition: "Signature",
        direction: "Shimla to Leh",
        leader: "Tushar",
      },
      {
        start: "2026-09-12",
        end: "2026-09-25",
        solo: 3300,
        twin: 2500,
        edition: "Photography",
        direction: "Leh to Shimla",
        leader: "Ravi",
      },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    route: { image: routeLadakh, alt: "Relief map of Ladakh and Himachal showing the expedition route" },
    program: [
      { day: 1, title: "Arrive in Shimla", stay: "Colonial era hotel", body: "Vehicle handover, kit check and the expedition briefing over dinner.", image: pinValley },
      { day: 2, title: "Shimla to Sangla", stay: "Camp in the Baspa valley", body: "Out of the hill station and up the Sutlej into Kinnaur, where the road starts getting interesting.", image: kazaLosar },
      { day: 3, title: "Sangla to Kalpa", stay: "Hotel facing Kinner Kailash", body: "A short day with the Kinner Kailash range directly across the valley from the balcony.", image: pinValley },
      { day: 4, title: "Kalpa to Nako", stay: "Guesthouse by the lake", body: "The vegetation runs out somewhere around Pooh. From here on it is cold desert.", image: kazaLosar },
      { day: 5, title: "Nako to Tabo", stay: "Monastery guesthouse", body: "Tabo monastery is over a thousand years old and its murals are the reason people call it the Ajanta of the Himalayas.", image: keyMonastery },
      { day: 6, title: "Tabo to Kaza", stay: "Hotel in Kaza", body: "Dhankar clinging to its ridge, then into Kaza, the only town in Spiti with a fuel pump.", image: keyMonastery },
      { day: 7, title: "Pin valley", stay: "Hotel in Kaza", body: "A day loop into the Pin valley and up to Key and Kibber. Snow leopard country, though you will not see one in summer.", image: pinValley },
      { day: 8, title: "Kaza to Chandratal", stay: "Camp by the lake", body: "Over the Kunzum La to the moon lake, at 4,300 metres, with the Chandra river below.", image: kazaLosar },
      { day: 9, title: "Chandratal to Jispa", stay: "Riverside lodge", body: "Down the Chandra and over into Lahaul. Back on tarmac and heading north.", image: manaliLehRock },
      { day: 10, title: "Jispa to Leh", stay: "Hotel in Leh", body: "The long one. Baralacha La, the Gata Loops, Taglang La and down the Indus into Leh.", image: manaliLeh },
      { day: 11, title: "Leh, rest and acclimatise", stay: "Hotel in Leh", body: "No driving. Permits, vehicle checks, and Thiksey in the afternoon if you want it.", image: thiksey },
      { day: 12, title: "Leh to Pangong Tso", stay: "Camp on the lake", body: "Over the Chang La and down to the lake. Bring a jacket, the wind gets up after four.", image: pangong },
      { day: 13, title: "Pangong to Nubra", stay: "Camp in Hunder", body: "The Shyok river road north, which is the roughest driving of the trip and the best.", image: nubra },
      { day: 14, title: "Nubra to Leh, and out", stay: "Hotel in Leh", body: "Back over Khardung La into Leh. Vehicles handed back, farewell dinner, flights out the following morning.", image: khardungLa },
    ],
    expect: [
      { key: "terrain", tab: "Terrain", title: "What is under the wheels", body: "Sealed road for most of Kinnaur and the run into Leh. Everything between Nako and Chandratal is gravel, and the Shyok river road is loose rock and water. Nothing needs winching, but low range gets used.", image: kazaLosar },
      { key: "vehicle", tab: "The vehicle", title: "What you will be driving", body: "Mahindra Thar 4x4 as standard, two people per vehicle unless a single supplement is taken. Prepared and serviced before every departure, and the mechanic travels in the convoy rather than meeting it.", image: manaliLehRock },
      { key: "beyond", tab: "Off the road", title: "The half of it that is not driving", body: "Tabo, Dhankar and Key monasteries, the Pin valley, and a lot of standing about at viewpoints because self drive means you stop when you want to.", image: keyMonastery },
      { key: "comforts", tab: "Where you sleep", title: "Comfort where there is any to be had", body: "Hotels and guesthouses in Kinnaur, Kaza and Leh, and fixed camps with proper beds at Chandratal, Pangong and Nubra, where nothing else exists at that altitude.", image: pangong },
    ],
    gallery: ladakhGallery,
  },

  {
    slug: "nepal-motorcycle-tour",
    package: pkg("nepalMotorcycle"),
    hero: padumRoad,
    heroAlt: "A mountain road in the Nepalese Himalayas",
    lead: "Ten days from Kathmandu up the deepest gorge on earth into Upper Mustang, the old walled kingdom of Lo, and back down through the Annapurna foothills.",
    place: {
      title: "Mustang: Tibet without the border crossing",
      body: "Nepal changes faster than any country its size. In two days of riding you go from terraced hillsides and pine forest to a bare ochre canyon with almost nothing growing in it. Upper Mustang was a separate kingdom until 2008 and closed to outsiders until 1992, and it shows: the villages, the monasteries and the language belong to the Tibetan plateau, not to Kathmandu. The riding is not the hardest we run. The wind coming up the Kali Gandaki every afternoon is what people remember.",
    },
    facts: [
      { key: "location", value: "Nepal, Kathmandu valley to Upper Mustang" },
      { key: "weather", value: "Max 28°C, min 2°C at altitude" },
      { key: "vehicle", value: "Royal Enfield Himalayan 450 or similar" },
      { key: "terrain", value: "Tarmac, gravel and riverbed" },
      { key: "distance", value: "± 1,100 km" },
      { key: "duration", value: "10 days" },
      { key: "difficulty", value: "Moderate" },
      { key: "groupSize", value: "10 riders" },
    ],
    departures: [
      { start: "2026-04-04", end: "2026-04-13", solo: 2450, twin: 1850, edition: "Signature", direction: "Kathmandu loop", leader: "Tushar" },
      { start: "2026-05-09", end: "2026-05-18", soldOut: true, solo: 2450, twin: 1850, edition: "Signature", direction: "Kathmandu loop", leader: "Ravi" },
      { start: "2026-10-10", end: "2026-10-19", solo: 2550, twin: 1950, edition: "Signature", direction: "Kathmandu loop", leader: "Tushar" },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    route: { image: routeNepal, alt: "Relief map of Nepal showing the expedition route" },
    program: [
      { day: 1, title: "Arrive in Kathmandu", stay: "Hotel in Thamel", body: "Bike handover, permits confirmed, and the expedition briefing over dinner in the old town.", image: enfield },
      { day: 2, title: "Kathmandu to Pokhara", stay: "Lakeside hotel", body: "Out of the valley and west along the Trishuli. Long day, good tarmac, the Annapurnas appearing at the end of it.", image: padumRoad },
      { day: 3, title: "Pokhara to Tatopani", stay: "Guesthouse by the hot springs", body: "Into the Kali Gandaki and the start of the climb. Forest, waterfalls and the road narrowing.", image: pinValley },
      { day: 4, title: "Tatopani to Jomsom", stay: "Lodge in Jomsom", body: "The gorge proper, Annapurna on one side and Dhaulagiri on the other. Riding stops early because of the wind.", image: padumRoad },
      { day: 5, title: "Jomsom to Muktinath", stay: "Lodge in Muktinath", body: "Up to 3,800 metres and a temple sacred to Hindus and Buddhists alike. Short day, deliberately.", image: keyMonastery },
      { day: 6, title: "Muktinath to Lo Manthang", stay: "Guesthouse inside the walls", body: "Into Upper Mustang on the restricted area permit. Ochre canyons, cave dwellings and a walled city at the end.", image: zanskarPeaks },
      { day: 7, title: "Lo Manthang", stay: "Guesthouse inside the walls", body: "A day in and around the old capital. Monasteries, the palace and a run out to the Chhoser caves.", image: diskit },
      { day: 8, title: "Lo Manthang to Tatopani", stay: "Guesthouse by the hot springs", body: "Back down the valley with the wind behind you for once, which makes it a very different ride.", image: padumRoad },
      { day: 9, title: "Tatopani to Pokhara", stay: "Lakeside hotel", body: "Out of the gorge and back into green. An afternoon off by the lake.", image: pinValley },
      { day: 10, title: "Pokhara to Kathmandu, and out", stay: "Hotel in Thamel", body: "The road back east, bikes handed in, farewell dinner. Flights out the following morning.", image: enfield },
    ],
    expect: [
      { key: "terrain", tab: "Terrain", title: "What is under the wheels", body: "Sealed road as far as Beni, then gravel and riverbed all the way up the Kali Gandaki. North of Jomsom it is loose and dusty. Nothing technical, but the surface is never quite what it was last season.", image: padumRoad },
      { key: "vehicle", tab: "The machine", title: "What you will be riding", body: "Royal Enfield Himalayan 450 as standard, prepared before every departure. Every bike carries a spares kit and the mechanic rides with the group.", image: enfield },
      { key: "beyond", tab: "Off the bike", title: "The half of it that is not riding", body: "Muktinath, the monasteries and palace at Lo Manthang, the cave dwellings at Chhoser, and an afternoon doing nothing at all beside Phewa lake.", image: keyMonastery },
      { key: "comforts", tab: "Where you sleep", title: "Comfort where there is any to be had", body: "Proper hotels in Kathmandu and Pokhara, and the best lodge in the village everywhere else. Upper Mustang is guesthouses, because that is all there is, and they are simple.", image: zanskarPeaks },
    ],
    gallery: ladakhGallery,
  },
];

export const getTour = (slug: string) => tourPages.find((tour) => tour.slug === slug);

export const tourRoutes = tourPages.map((tour) => `/tours/${tour.slug}`);
