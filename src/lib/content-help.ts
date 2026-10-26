/* ---------------------------------------------------------------------------
   "Start here" — the plain-language question hub (/questions,
   /es/preguntas-frecuentes). Written for someone who has never hired a
   contractor, and for the landlords, property managers and realtors who
   hire one every month. Every answer: the direct answer in the first
   sentence, then the local specifics, then a link to go deeper.

   Answers support inline links: [text](service:painting), (guide:permits),
   (page:estimator), (area:opelika) — see src/lib/guide-kit.ts.
   Local facts verified September 2026; re-check utilities and permit
   offices each January.
   ------------------------------------------------------------------------- */
import type { Locale } from "./i18n";
import { mid } from "./guide-kit";

export type Audience = "home" | "business";
export interface HelpQ { q: string; a: string }
export interface HelpGroup { id: string; audience: Audience; h: string; intro: string; qs: HelpQ[] }
export interface LocalFact { label: string; auburn: string; opelika: string; note?: string }
export interface HelpCopy {
  title: string; description: string; eyebrow: string; h1: string; lede: string;
  /** The two lanes shown as big choice cards at the top. */
  audiences: Record<Audience, { label: string; blurb: string }>;
  searchLabel: string; searchPh: string; noResults: string; showing: string; all: string;
  groups: HelpGroup[];
  localH: string; localP: string; localCols: [string, string, string]; local: LocalFact[];
  glossaryH: string; glossaryP: string; glossary: { term: string; def: string }[];
  stillH: string; stillP: string;
}

/* Local-table sources (checked September 2026):
   Auburn permits: auburnal.gov/inspection-services · Opelika permits: opelika-al.gov/193/Building-Inspection-Division
   Historic: auburnal.gov/HPC + Auburn HPC design review standards · opelika-al.gov/555/District-Maps-Information
   Utilities: Auburn CompPlan 2030 ch. 7 (static.auburnalabama.org/media/apps/www/compplan2030/7.0-Utilities.pdf),
   auburnal.gov/water-resource-management · opelika-al.gov/326/Utilities, opelika-al.gov/930/Opelika-Power-Services
   Debris: auburnal.gov/garbage-and-recycling · opelika-al.gov/217/Trash-Yard-Waste-Services
   811: al811.com · Records: leecountyrevenuecommissioner.com, leecountyal.gov (Probate, recording) */
export const HELP: Record<Locale, HelpCopy> = {
  /* ================================================================ ENGLISH */
  en: {
    title: "Remodeling & Painting Questions, Answered | Auburn, AL",
    description: "Plain answers for first-time homeowners, landlords and realtors in Auburn and Opelika, AL: estimates, prices, permits, timelines, rentals and Spanish.",
    eyebrow: "Start here · Questions, answered",
    h1: "New to hiring a contractor? Start here.",
    lede: "These are the questions people actually ask us before, during and after a job, answered in plain words. Pick your lane below or type a word in the search box.",
    audiences: {
      home: { label: "For my home", blurb: "Homeowners, first-time buyers and families: how estimates, prices, permits and the work itself go." },
      business: { label: "For rentals and clients", blurb: "Landlords, property managers, realtors and HOAs: turnovers, work orders, listing repairs and approvals." },
    },
    searchLabel: "Type your question",
    searchPh: "Try permit, deposit, lead paint, rental, Spanish...",
    noResults: "No matches. Try a simpler word, or call us.",
    showing: "Showing {n} of {total}",
    all: "All questions",
    groups: [
      /* ------------------------------------------------ HOME */
      {
        id: "first-steps", audience: "home", h: "First steps",
        intro: "If you have never hired a contractor before, start with these.",
        qs: [
          { q: "I've never hired a contractor. Where do I start?", a: "Start with a sentence about what you want to change and a few phone photos of the room. You don't need drawings or a budget figured out yet. Call, text, WhatsApp or [send the short form](page:contact), and we'll set a time to walk through the house with you. After that visit you get a written estimate to think over at your own pace." },
          { q: "What should I have ready before the first visit?", a: "A few photos, a rough budget (even a wide range helps), and any date that matters, like a move-in or a family event. Screenshots of rooms you like are useful too. If you're in an HOA neighborhood or a historic district, have the rules handy. Our [cost estimator](page:estimator) gives you a planning number before we talk." },
          { q: "How does a free estimate work?", a: "We come out, look at the house, measure and listen to what you want. Then we send a written scope, meaning a list of exactly what will be done, with a line-by-line price and a realistic timeline. There's no fee and no obligation. That written number is the one we hold to unless you change the plan." },
          { q: "What's the difference between an estimate, a quote and a bid?", a: "Contractors use the three words loosely, so don't get hung up on the label. What matters is that the price is written, itemized, and says what is included and what is not. A number said out loud in the driveway isn't something either side can hold to." },
          { q: "How many quotes should I get?", a: "For a bigger project, two or three is normal. Compare the scope, not only the total: the lowest number often leaves out prep, permits, hauling away debris or part of the materials. Ask every contractor the same questions and get every answer in writing. Our [guide to checking a contractor in Alabama](guide:hire-contractor) has a simple checklist." },
          { q: "How do I know a contractor is legitimate?", a: "In Alabama, residential work over $10,000 in labor and materials requires a license from the Home Builders Licensure Board (HBLB), and you can look any license up on the HBLB website. Also ask for a certificate of insurance and a written contract before you pay anything. We're glad to send our license and insurance certificate before you sign." },
          { q: "Is my project too small for you?", a: "Probably not. Small repairs like drywall patches, doors, trim and rotten boards are regular work for us, and our [repairs page](service:repairs) lists typical prices. If you have several small items, putting them on one list for one visit gets more done for the trip." },
          { q: "How soon can you come look at my house?", a: "We reply to calls, texts and forms within one business day, in English or Spanish. The walkthrough itself is usually within a few business days, and Auburn is the easiest to schedule because it's home base. Further out in our [service area](page:areas), we group visits to get to you sooner." },
        ],
      },
      {
        id: "money", audience: "home", h: "Money and pricing",
        intro: "How prices are built, how payments usually work, and what can change the number.",
        qs: [
          { q: "How do contractors price a job?", a: "A price is labor, materials and the condition of the house, plus things like permits and hauling debris away. That's why two kitchens of the same size can cost very different amounts. Our [service pages](page:services) show typical ranges, and your written estimate breaks the price into lines so you can see where the money goes." },
          { q: "How much will my project cost?", a: "It depends on size, finishes and what shape the house is in, so the honest answer comes after a walkthrough. For a planning number now, use our [cost estimator](page:estimator), which is built on real Auburn and Opelika pricing. Our cost guides go deeper for [painting](guide:painting-cost), kitchens and bathrooms." },
          { q: "Do I have to pay a deposit?", a: "Most contractors ask for one to hold your dates and order materials. Ours works like this: a deposit to schedule and order materials, progress payments at agreed milestones, and the balance after your final walkthrough, all written in the estimate. The FTC's general advice holds for anyone you hire: don't pay the whole job up front, avoid cash, and tie payments to work that's actually done." },
          { q: "What can change the price after I sign?", a: "Three things: you change the plan, you pick different materials, or we find a hidden problem such as rot or bad wiring behind a wall. In every case we tell you first, and nothing changes until you approve it in writing. There are no surprise invoices at the end." },
          { q: "What is a change order?", a: "A change order is a short written agreement to add, remove or change something after the contract is signed, with the new price and any change in time. You sign it before the extra work is done, not after. It protects you from surprise bills and protects the contractor from misunderstandings." },
          { q: "What is an allowance?", a: "An allowance is a set amount in the estimate for something you haven't picked yet, like tile, a faucet or light fixtures. If you choose something that costs more, you pay the difference; if it costs less, the price goes down. Picking your finishes before the estimate, when you can, makes the number firmer. Our [kitchen cost guide](guide:kitchen-cost) shows how finishes move the total." },
          { q: "Is it cheaper to paint my cabinets or replace them?", a: "If the cabinet boxes are solid and you like the layout, painting them is usually far cheaper than replacing them. If the boxes are water-damaged or the layout doesn't work, new cabinets make more sense. Our [paint vs. replace guide](guide:cabinets-paint-vs-replace) walks through how to decide." },
        ],
      },
      {
        id: "permits-rules", audience: "home", h: "Permits, rules and safety",
        intro: "What the city, your HOA and the law expect, in plain words.",
        qs: [
          { q: "Do I need a permit for my project?", a: "Painting, new flooring and cabinet painting usually don't need one. Moving plumbing, adding electrical circuits, changing walls, building a deck or an addition usually do. Inside Auburn the permit comes from the City of Auburn, inside Opelika from the City of Opelika, and outside city limits from Lee County. Our [permit guide](guide:permits) explains each case." },
          { q: "Who pulls the permit, me or the contractor?", a: "For permitted work, we pull the permit in our name, schedule the inspections and meet the inspector. Be careful if any contractor asks you to pull the permit yourself as the owner: that usually makes you the person responsible for the work meeting code." },
          { q: "Are permits different in Auburn and Opelika?", a: "The idea is the same, the offices and steps differ. Auburn permits go through the City's Inspection Services on N. Ross Street and an online portal. Opelika requires plans plus separate electrical, plumbing and mechanical permits, review usually takes 3 to 4 business days, and the permit card has to be posted at the house. See the [Opelika page](area:opelika) for more." },
          { q: "My house is in a historic district. What changes?", a: "Exterior changes that can be seen from the street usually need a Certificate of Appropriateness, an approval from the city's Historic Preservation Commission, before work starts. In Auburn that means the North College Historic District; in Opelika, districts include Northside, Downtown and Geneva Street. Interior work generally doesn't need it. Plan a few extra weeks, and see our [Auburn page](area:auburn) for details." },
          { q: "Do I need my HOA's approval?", a: "For exterior work, very often yes. Most Auburn subdivisions have rules about paint colors, additions and fences, reviewed by a board or an architectural review committee (ARC). Get the approval in writing before work starts. We prepare color chips, drawings and material specs for your application, for [exterior painting](service:painting) and any other outside work." },
          { q: "My house was built before 1978. What about lead paint?", a: "Homes built before 1978 may have lead-based paint, and the dust from sanding or demolition is most dangerous for young children and pregnant women. Under the federal EPA rule known as RRP (Renovation, Repair and Painting), paid work that disturbs painted surfaces in these homes must be done by an EPA-certified firm using lead-safe methods, and you should receive the Renovate Right pamphlet before work starts. Ask any contractor, us included, to show the firm certificate first. The [EPA's RRP page](https://www.epa.gov/lead/renovation-repair-and-painting-program) explains the rule." },
          { q: "Do I need to call before digging for a deck, fence or addition?", a: "Yes. Alabama law requires anyone digging, homeowners included, to contact Alabama 811 at least two full working days before the dig. It's free: call 811 or 800-292-8525, or file online at [al811.com](https://al811.com), and the utility companies mark their buried lines. If your project includes digging, make sure a locate request has been made before the first shovel goes in." },
        ],
      },
      {
        id: "during-the-job", audience: "home", h: "While the work is happening",
        intro: "What living with a project is actually like, and what happens when there's a surprise.",
        qs: [
          { q: "Can I live at home during the remodel?", a: "Usually yes. Painting, floors and most bathroom work are fine to live through, and during a [kitchen remodel](service:kitchen) most families set up a small temporary kitchen with the fridge and a microwave. If your home has only one bathroom, tell us and we'll plan the order of work around it." },
          { q: "What hours will the crew be at my house?", a: "We agree on start and finish times before the job begins and stick to them. Tell us about anything we should work around, like a baby's nap, a night shift or working from home. If something changes, we call; you're never left guessing." },
          { q: "What about my pets and kids?", a: "Plan to keep pets in a closed room or away from the work area, since doors will be open and there will be tools, paint and debris around. Tell us about pets and kids on the walkthrough and we'll set up the work area with them in mind." },
          { q: "How much dust and mess should I expect?", a: "Painting and flooring make little dust; sanding, drywall and demolition make more. We put up dust barriers, protect floors and clean up every day. In a pre-1978 home, dust from old paint needs lead-safe handling, covered in the lead paint question above." },
          { q: "How long will my project take?", a: "Typical on-site times: interior painting 2 to 7 days for most homes, new floors 1 to 5 days, cabinet painting 3 to 7 days, a [bathroom remodel](service:bathroom) 2 to 4 weeks, and a kitchen 2 to 6 weeks. Additions run longer and start after permits. Your written estimate includes a realistic timeline for your job." },
          { q: "What if you find a problem behind a wall?", a: "We stop, show you, and explain your options with a written price before fixing anything. In older homes, common in Opelika and rural [Lee County](area:lee-county), the usual surprises are rotten wood, old galvanized pipes or outdated wiring. You hear about it first and you decide; nothing is added to the bill without your signature." },
          { q: "Does rain or heat delay exterior painting?", a: "It can. Paint needs a dry surface and the right temperature, so we move exterior days around rain and heavy humidity rather than paint in bad conditions. In Lee County, fall is usually the best season. Our [exterior paint timing guide](guide:exterior-paint-timing) explains why." },
          { q: "Do I need to move furniture or pack up the room?", a: "Your estimate says who moves what, so ask on the walkthrough. Either way, it helps to put away small items, valuables and anything breakable before the crew arrives, and to clear a path to the work area." },
        ],
      },
      {
        id: "after", audience: "home", h: "When the work is done",
        intro: "The final walkthrough, the paperwork to keep, and what to do if something isn't right.",
        qs: [
          { q: "What is a punch list?", a: "A punch list is the list of small things left to fix at the end: a paint drip, a missing outlet cover, a sticky door. We walk the job with you before we call it done, write everything down and finish it. The final payment comes after that walkthrough." },
          { q: "Is there a warranty?", a: "Ask any contractor to put the workmanship warranty in writing before you sign: what it covers, for how long, and how to make a claim. Materials like flooring, paint and fixtures often carry their own manufacturer warranties, separate from the labor. Keep both with your contract." },
          { q: "What should I get when I make the final payment?", a: "A final invoice showing what you paid, any warranty papers, and on larger jobs a lien release, a document saying the people who supplied work or materials have been paid and won't make a claim against your home. The FTC recommends collecting one with the last payment. Our [contractor checklist](guide:hire-contractor) explains more." },
          { q: "What if something isn't right after you leave?", a: "Call or text the owner first and we'll make it right. Describe what you see and send a photo if you can, so we arrive with the right materials." },
          { q: "Can I keep leftover paint for touch-ups?", a: "Yes, ask us to leave labeled leftover paint. Write down the brand, color name and sheen, meaning how shiny the finish is, so a future touch-up matches. Store cans indoors, away from freezing and heat." },
          { q: "How do I leave a review?", a: "On Google, Angi or HomeAdvisor, whichever you already use; our [reviews page](page:reviews) has the links. Two minutes from you is how the next family on your street finds a contractor they can trust." },
        ],
      },
      {
        id: "language", audience: "home", h: "Spanish, English or both",
        intro: "The whole job can happen in the language you're most comfortable with.",
        qs: [
          { q: "Can I do the whole project in Spanish?", a: "Yes. The visit, the written estimate, the contract, calls and WhatsApp messages can all be in Spanish, from start to finish. Our [Spanish-language guide](guide:bilingual-contractor) explains what to ask any contractor." },
          { q: "Can I message you on WhatsApp?", a: "Yes. Send photos of the project on WhatsApp and we'll reply with next steps, in English or Spanish. It's often the easiest way to show us a problem; the number is on our [contact page](page:contact)." },
          { q: "Will my written estimate and contract be in Spanish?", a: "If you prefer, yes, along with every change order. You should never sign something you can't read comfortably." },
          { q: "Some of us speak Spanish and some speak English. Can everyone be included?", a: "Yes. Mixed-language families are common here, so we can keep one person informed in Spanish and another in English, or put everyone on the same messages." },
        ],
      },
      /* ------------------------------------------------ BUSINESS */
      {
        id: "landlords", audience: "business", h: "Landlords and rental owners",
        intro: "Turnovers around the Auburn lease calendar, for owners nearby or far away.",
        qs: [
          { q: "When should I book a turnover before Auburn's summer move-in?", a: "In spring. Most Auburn leases end and start within the same few summer weeks, so crews and materials get booked early. Send us your move-out and move-in dates and we'll schedule the turn to fit. See [rental turnovers](service:rental)." },
          { q: "How long does a rental turn take?", a: "Most units take 2 to 10 days, depending on condition. A typical 3-bedroom getting new LVP flooring takes 2 to 4 days, and paint can happen at the same time. Our [turnover guide](guide:rental-turnover) shows the order of work that keeps it fast." },
          { q: "How much does a rental turn cost?", a: `A light turn (paint, patching and fixes) usually runs ${mid("rental", 0)}, a medium turn with LVP and new fixtures ${mid("rental", 1)}, and a heavy turn with kitchen or bath updates ${mid("rental", 2)} per unit. Pet damage and neglected maintenance move the number more than size. Several units, or a standing turnover agreement, lower the per-unit cost.` },
          { q: "I live out of town. How will I know the work is done?", a: "You get before-and-after photos of every room, an itemized invoice you can forward to your accountant, and a walkthrough video on request. Tell us how you want access handled, through a lockbox, your property manager or a neighbor, and we'll work with it. You have one person to call." },
          { q: "Can you work while a tenant still lives there?", a: "Often, yes, especially for repairs. You or your manager arrange access and give the tenant the notice your lease and Alabama law require; we show up in the window you set and keep the work area tidy." },
          { q: "We bought a condo for our student. What should we plan for?", a: "Plan the year around the lease: turnover work booked in spring, small repairs during school breaks, and one yearly checklist for the air conditioner, water heater, smoke alarms and caulk. Our [student condo guide](guide:student-condo) lays out the calendar." },
          { q: "What finishes hold up best in a rental?", a: "Waterproof LVP flooring instead of carpet, durable paint that touches up well, and the same standard colors and sheens in every unit so future touch-ups match. Our [flooring guide](guide:flooring-humidity) compares floors for humidity, pets and tenants." },
        ],
      },
      {
        id: "property-managers", audience: "business", h: "Property managers",
        intro: "Work orders, billing and paperwork for managers who hire every month.",
        qs: [
          { q: "Can you work from our work orders?", a: "Yes. We can work directly from a property manager's work order and bill either the owner or the management company, whichever you prefer. See how we run [rental turnovers](service:rental)." },
          { q: "Can you send a certificate of insurance?", a: "Yes. We carry general liability insurance, and a certificate of insurance (COI) is available on request before any work starts. If your company requires specific coverage or wording, send the requirements and we'll tell you straight whether we can meet them." },
          { q: "How fast do you respond?", a: "We reply within one business day. How soon we can start depends on the season: summer in Auburn is the tightest, so book turnovers in spring. For repeat work, tell us what you have coming and we'll plan ahead with you." },
          { q: "Can you handle several units or a whole portfolio?", a: "Yes. Multiple units or a standing turnover agreement lower the per-unit cost, and we keep standard paint colors, sheens and LVP lines so every unit matches and future repairs are simple." },
          { q: "What documentation do you provide?", a: "Written scopes and prices per unit, before-and-after photos, and itemized invoices you can pass to the owner or the accountant." },
        ],
      },
      {
        id: "realtors-sellers", audience: "business", h: "Realtors, sellers and investors",
        intro: "Getting a house ready to list, and getting through the inspection list before closing.",
        qs: [
          { q: "What should a seller fix before listing?", a: "Usually fresh neutral paint, worn flooring, and the small punch-list items buyers notice: sticky doors, damaged trim, missing covers, stained caulk. Those cost little compared to how much they change first impressions. We do pre-listing punch lists; start with [painting](service:painting)." },
          { q: "Can you handle the buyer's inspection repair list?", a: "Send us the inspection report. We'll price the [repair items](service:repairs) in our scope in writing and tell you straight which ones need a different trade, so nothing falls through the cracks before closing." },
          { q: "How fast can you work before a closing date?", a: "Many repairs take 1 to 3 days and interior painting 2 to 7 days for most homes. Send the closing date as soon as you have it, since anything needing a permit adds time." },
          { q: "What upgrades pay off in a builder-grade flip or rental?", a: "Whole-interior paint in a modern neutral, painted cabinets with new hardware, LVP instead of carpet, new lighting, and a bathroom refresh give the most impact per dollar. Our [builder-grade upgrade guide](guide:builder-grade-upgrades) ranks them with Auburn prices." },
        ],
      },
      {
        id: "hoa-condo", audience: "business", h: "HOAs, condos and other jobs",
        intro: "Board approvals, condo rules, and whether a job is a fit.",
        qs: [
          { q: "We're an HOA or condo board. Can you work on common areas?", a: "Ask us. Our focus is homes and rental properties, so tell us the scope and we'll tell you straight whether it's a fit for our crew." },
          { q: "How does board or ARC approval work for a homeowner's project?", a: "The homeowner submits the plan to the board or architectural review committee before any exterior work. We prepare the color chips, drawings and material specs for the application, and we start only after approval is in writing." },
          { q: "What should I know before remodeling a condo unit?", a: "Get your association's rules first: work hours, parking, elevator use, noise and where debris can go. Alabama's HBLB license rule for jobs over $10,000 covers condos too. Share the rules with us before the estimate so the price and schedule account for them." },
          { q: "Do you do small commercial jobs like offices or shops?", a: "Our focus is homes and rental properties. If you have a small commercial job, [call or write](page:contact) and describe it; we'll tell you straight whether it's a fit." },
        ],
      },
    ],
    localH: "Auburn vs. Opelika: who to call for what",
    localP: "Auburn and Opelika sit side by side but run many services differently. Here's who handles what on a home project. Checked September 2026; confirm details for your address.",
    localCols: ["", "Auburn", "Opelika"],
    local: [
      { label: "Building permits", auburn: "City of Auburn Inspection Services, 171 N. Ross St. (334) 501-3170", opelika: "Opelika Building Inspection Division, 710 Fox Trail (Public Works). (334) 705-5420", note: "Outside city limits, Lee County issues permits." },
      { label: "Historic districts", auburn: "North College Historic District", opelika: "Northside, Downtown, Geneva Street, and Pepperell Mill & Village", note: "Exterior changes in a local district need a Certificate of Appropriateness." },
      { label: "Electricity", auburn: "Mostly Alabama Power; some areas Tallapoosa River Electric Cooperative or Dixie Electric Cooperative", opelika: "City-owned Opelika Power Services; some areas Alabama Power or Tallapoosa River Electric Cooperative", note: "Check your bill; the provider depends on your address." },
      { label: "Natural gas", auburn: "Spire", opelika: "Spire or Southeast Gas" },
      { label: "Water and sewer", auburn: "Water: Water Works Board of the City of Auburn. Sewer: City of Auburn (Water Resource Management)", opelika: "Water: Opelika Utilities. Sewer: City of Opelika Public Works" },
      { label: "Renovation debris", auburn: "Not picked up with bulk trash; construction material is excluded", opelika: "Not picked up; whoever does the work removes the waste", note: "Ask your contractor whether hauling debris is in the price." },
      { label: "Call before you dig", auburn: "Alabama 811: dial 811 or 800-292-8525, or al811.com", opelika: "Same: Alabama 811", note: "Free. At least two full working days before digging." },
      { label: "Property records", auburn: "Lee County Revenue Commissioner and Probate Judge, Lee County Courthouse, 215 S. 9th St., Opelika", opelika: "Same county offices", note: "Useful for owner names, deeds and tax records." },
    ],
    glossaryH: "Words you'll hear on a job",
    glossaryP: "Plain definitions for the terms that show up on estimates, contracts and job sites.",
    glossary: [
      { term: "Scope of work", def: "The written list of exactly what will be done, and what won't. If it isn't in the scope, it isn't in the price." },
      { term: "Written estimate", def: "A price on paper, broken into lines, with the scope and a timeline. The number you can compare and hold a contractor to." },
      { term: "Change order", def: "A signed, written change to the contract after it starts, with the new price and time, agreed before the extra work is done." },
      { term: "Deposit", def: "The first payment, usually to reserve dates and order materials. It should be a part of the price, not the whole job." },
      { term: "Draw (progress payment)", def: "A payment made when an agreed stage of the job is finished, such as demolition, rough-in or cabinets installed." },
      { term: "Allowance", def: "A set amount in the estimate for items you haven't picked yet, like tile or light fixtures. Pick pricier items and you pay the difference." },
      { term: "Lien release (lien waiver)", def: "A document saying a contractor, subcontractor or supplier has been paid and won't claim against your home. Collect one with payments, especially the last." },
      { term: "Permit", def: "Permission from the city or county to do certain work, such as plumbing, electrical, structural changes or additions." },
      { term: "Inspection", def: "A visit from the city or county inspector to check that permitted work meets code before it's covered up or finished." },
      { term: "Punch list", def: "The final list of small fixes found on the last walkthrough, finished before the job is called done." },
      { term: "COI (certificate of insurance)", def: "A one-page document from the contractor's insurance company proving their coverage is active." },
      { term: "HBLB license", def: "Alabama Home Builders Licensure Board license, required for residential work over $10,000 in labor and materials." },
      { term: "Make-ready (turnover)", def: "Getting a rental ready for the next tenant: repairs, paint, floors, cleaning." },
      { term: "LVP", def: "Luxury vinyl plank: a waterproof, tough plank floor that looks like wood. A favorite for rentals, kids and pets." },
      { term: "Primer", def: "The first coat that helps paint stick and hides stains or patches. Skipping it is why cheap paint jobs peel." },
      { term: "Sheen", def: "How shiny paint is, from flat to matte, eggshell, satin, semi-gloss and gloss. Shinier finishes wipe clean more easily but show flaws more." },
      { term: "Drywall", def: "The panels that make most interior walls and ceilings. Also called sheetrock or gypsum board." },
      { term: "Subfloor", def: "The structural layer under your finished floor. If it's soft or rotten, it has to be fixed before new flooring goes down." },
      { term: "GFCI outlet", def: "An outlet with test and reset buttons that cuts power in a fraction of a second if it senses a shock risk. Required near water." },
      { term: "Rough-in", def: "The stage when new pipes, wires and ducts are run inside open walls, before inspection and drywall." },
      { term: "HOA / ARC approval", def: "Written permission from your homeowners association or its architectural review committee for exterior changes." },
      { term: "RRP (lead-safe)", def: "The federal EPA rule for paid work that disturbs paint in homes built before 1978: certified firm, lead-safe methods, careful cleanup." },
    ],
    stillH: "Still have a question?",
    stillP: "Ask us directly. Call, text or WhatsApp, or send the short form, in English or Spanish, and you'll hear back within one business day.",
  },

  /* ================================================================ ESPAÑOL */
  es: {
    title: "Preguntas sobre remodelación y pintura | Auburn, AL",
    description: "Respuestas claras para dueños de casa, arrendadores y agentes en Auburn y Opelika, AL: presupuestos, precios, permisos, tiempos, rentas y más.",
    eyebrow: "Empiece aquí · Preguntas frecuentes",
    h1: "¿Primera vez que contrata a un contratista? Empiece aquí.",
    lede: "Estas son las preguntas que la gente nos hace antes, durante y después de una obra, contestadas en palabras sencillas. Elija su caso abajo o escriba una palabra en el buscador.",
    audiences: {
      home: { label: "Para mi casa", blurb: "Dueños de casa, compradores primerizos y familias: cómo funcionan el presupuesto, los precios, los permisos y la obra." },
      business: { label: "Para rentas y clientes", blurb: "Arrendadores, administradores de propiedades, agentes y HOA: cambios de inquilino, órdenes de trabajo, reparaciones para vender y aprobaciones." },
    },
    searchLabel: "Escriba su pregunta",
    searchPh: "Por ejemplo: permiso, depósito, plomo, renta, WhatsApp...",
    noResults: "No encontramos nada. Pruebe con una palabra más sencilla, o llámenos.",
    showing: "Mostrando {n} de {total}",
    all: "Todas las preguntas",
    groups: [
      /* ------------------------------------------------ CASA */
      {
        id: "first-steps", audience: "home", h: "Los primeros pasos",
        intro: "Si nunca ha contratado a un contratista, empiece por aquí.",
        qs: [
          { q: "Nunca he contratado a un contratista. ¿Por dónde empiezo?", a: "Empiece con una frase de lo que quiere cambiar y unas fotos del cuarto tomadas con el celular. No necesita planos ni tener el presupuesto definido. Llame, mande mensaje o WhatsApp, o [llene el formulario corto](page:contact), y acordamos una hora para ver la casa con usted. Después de esa visita recibe un presupuesto por escrito para pensarlo con calma." },
          { q: "¿Qué debo tener listo para la primera visita?", a: "Unas fotos, una idea de cuánto quiere gastar (aunque sea un rango amplio) y cualquier fecha importante, como una mudanza o una fiesta familiar. También sirven capturas de pantalla de cuartos que le gusten. Si vive en un fraccionamiento con HOA o en una zona histórica, tenga a la mano las reglas. Nuestra [calculadora de costos](page:estimator) le da un número aproximado antes de hablar." },
          { q: "¿Cómo funciona el presupuesto gratis?", a: "Vamos a su casa, revisamos, medimos y escuchamos lo que quiere. Luego le mandamos por escrito el alcance, es decir, la lista exacta de lo que se va a hacer, con el precio renglón por renglón y un tiempo realista. No cuesta nada y no lo compromete a nada. Ese precio por escrito es el que respetamos, a menos que usted cambie el plan." },
          { q: "¿Qué diferencia hay entre presupuesto, cotización y oferta?", a: "Los contratistas usan esas palabras casi igual, así que no se preocupe por el nombre. Lo importante es que el precio esté por escrito, desglosado, y que diga qué incluye y qué no. Un número dicho de palabra en la entrada de la casa no le sirve a nadie para reclamar después." },
          { q: "¿Cuántos presupuestos debo pedir?", a: "Para una obra grande, lo normal es pedir dos o tres. Compare lo que incluye cada uno, no solo el total: el precio más bajo muchas veces deja fuera la preparación, los permisos, llevarse el escombro o parte del material. Hágale a cada contratista las mismas preguntas y pida todas las respuestas por escrito. Nuestra [guía para verificar a un contratista en Alabama](guide:hire-contractor) trae una lista sencilla." },
          { q: "¿Cómo sé si un contratista es de confianza?", a: "En Alabama, las obras residenciales de más de $10,000 entre mano de obra y material requieren licencia de la Home Builders Licensure Board (HBLB), y cualquier licencia se puede buscar en la página de la HBLB. Pida también el certificado de seguro y un contrato por escrito antes de pagar. Con gusto le mandamos nuestra licencia y nuestro certificado de seguro antes de que firme." },
          { q: "¿Mi trabajo es muy chico para ustedes?", a: "Seguramente no. Las reparaciones chicas, como resanes de tablaroca, puertas, molduras y tablas podridas, son trabajo de todos los días para nosotros, y en nuestra [página de reparaciones](service:repairs) están los precios típicos. Si tiene varias cosas pendientes, júntelas en una lista para una sola visita y se aprovecha mejor el viaje." },
          { q: "¿Qué tan pronto pueden venir a ver mi casa?", a: "Contestamos llamadas, mensajes y formularios en un día hábil, en español o en inglés. La visita normalmente es en unos pocos días hábiles, y en Auburn es donde más fácil nos acomodamos porque es nuestra base. Más lejos dentro de nuestra [zona de servicio](page:areas), juntamos visitas para llegar más pronto." },
        ],
      },
      {
        id: "money", audience: "home", h: "Dinero y precios",
        intro: "Cómo se arma un precio, cómo suelen ser los pagos y qué puede cambiar el número.",
        qs: [
          { q: "¿Cómo le pone precio un contratista a una obra?", a: "El precio es la mano de obra, el material y el estado de la casa, más cosas como permisos y llevarse el escombro. Por eso dos cocinas del mismo tamaño pueden costar muy distinto. En nuestras [páginas de servicios](page:services) están los rangos típicos, y su presupuesto por escrito viene desglosado para que vea a dónde va cada dólar." },
          { q: "¿Cuánto va a costar mi proyecto?", a: "Depende del tamaño, de los acabados y de cómo esté la casa, así que la respuesta honesta llega después de la visita. Para tener un número aproximado desde ya, use nuestra [calculadora de costos](page:estimator), hecha con precios reales de Auburn y Opelika. Nuestras guías de costos explican más sobre [pintura](guide:painting-cost), cocinas y baños." },
          { q: "¿Tengo que dar un depósito?", a: "Casi todos los contratistas piden uno para apartar las fechas y comprar el material. Con nosotros funciona así: un depósito para agendar y pedir material, pagos parciales en etapas acordadas y el resto después del recorrido final, todo por escrito en el presupuesto. El consejo general de la FTC vale para cualquier contratista: no pague toda la obra por adelantado, evite pagar en efectivo y pague conforme se termina el trabajo." },
          { q: "¿Qué puede cambiar el precio después de firmar?", a: "Tres cosas: que usted cambie el plan, que elija otros materiales o que encontremos un problema escondido, como madera podrida o cableado en mal estado dentro de una pared. En todos los casos le avisamos primero, y nada cambia hasta que usted lo aprueba por escrito. Al final no hay cobros sorpresa." },
          { q: "¿Qué es una orden de cambio?", a: "Una orden de cambio (change order) es un acuerdo corto por escrito para agregar, quitar o cambiar algo después de firmar el contrato, con el precio nuevo y, si aplica, el tiempo extra. Se firma antes de hacer el trabajo extra, no después. Lo protege a usted de cobros sorpresa y al contratista de malentendidos." },
          { q: "¿Qué es una asignación (allowance)?", a: "Es una cantidad fija dentro del presupuesto para algo que todavía no escoge, como el azulejo, la llave del fregadero o las lámparas. Si escoge algo más caro, paga la diferencia; si es más barato, el precio baja. Si puede escoger los acabados antes del presupuesto, el número queda más firme. Nuestra [guía de costos de cocina](guide:kitchen-cost) muestra cómo los acabados mueven el total." },
          { q: "¿Sale más barato pintar los gabinetes o cambiarlos?", a: "Si las cajas de los gabinetes están firmes y le gusta cómo están acomodados, pintarlos casi siempre cuesta mucho menos que cambiarlos. Si están dañados por agua o la distribución no le funciona, conviene más ponerlos nuevos. Nuestra [guía de pintar o cambiar gabinetes](guide:cabinets-paint-vs-replace) le ayuda a decidir." },
        ],
      },
      {
        id: "permits-rules", audience: "home", h: "Permisos, reglas y seguridad",
        intro: "Lo que piden la ciudad, su HOA y la ley, explicado sin rodeos.",
        qs: [
          { q: "¿Necesito permiso para mi proyecto?", a: "Pintar, poner piso nuevo o pintar gabinetes normalmente no lo necesita. Mover plomería, agregar circuitos eléctricos, cambiar paredes, construir una terraza o una ampliación casi siempre sí. Dentro de Auburn el permiso lo da la ciudad de Auburn, dentro de Opelika la ciudad de Opelika, y fuera de los límites de la ciudad, el condado de Lee. Nuestra [guía de permisos](guide:permits) explica cada caso." },
          { q: "¿Quién saca el permiso, yo o el contratista?", a: "Cuando la obra lleva permiso, nosotros lo sacamos a nuestro nombre, programamos las inspecciones y recibimos al inspector. Tenga cuidado si algún contratista le pide que usted saque el permiso como dueño: normalmente eso lo hace a usted el responsable de que la obra cumpla con el código." },
          { q: "¿Los permisos son distintos en Auburn y en Opelika?", a: "La idea es la misma, pero cambian las oficinas y los pasos. En Auburn los permisos se tramitan con Inspection Services de la ciudad, en la calle N. Ross, y en un portal en línea. Opelika pide planos y además permisos aparte de electricidad, plomería y aire acondicionado; la revisión suele tardar de 3 a 4 días hábiles y la tarjeta del permiso tiene que estar a la vista en la casa. Vea más en nuestra [página de Opelika](area:opelika)." },
          { q: "Mi casa está en una zona histórica. ¿Qué cambia?", a: "Los cambios exteriores que se ven desde la calle normalmente necesitan un Certificado de Conformidad (Certificate of Appropriateness), una aprobación de la Comisión de Preservación Histórica de la ciudad, antes de empezar. En Auburn eso aplica al North College Historic District; en Opelika, entre otros, a Northside, el centro y Geneva Street. El trabajo interior casi nunca lo necesita. Cuente con unas semanas más y vea los detalles en nuestra [página de Auburn](area:auburn)." },
          { q: "¿Necesito la aprobación de mi HOA?", a: "Para trabajos exteriores, muchas veces sí. Casi todos los fraccionamientos de Auburn tienen reglas sobre colores de pintura, ampliaciones y cercas, que revisa la mesa directiva o un comité de revisión (ARC). Consiga la aprobación por escrito antes de empezar. Nosotros preparamos las muestras de color, los planos y las especificaciones para su solicitud, para [pintura exterior](service:painting) o cualquier otro trabajo por fuera." },
          { q: "Mi casa es de antes de 1978. ¿Qué pasa con la pintura con plomo?", a: "Las casas construidas antes de 1978 pueden tener pintura con plomo, y el polvo que sale al lijar o demoler es más peligroso para los niños pequeños y las mujeres embarazadas. Según la regla federal de la EPA llamada RRP (renovación, reparación y pintura), el trabajo pagado que toca superficies pintadas en estas casas lo debe hacer una empresa certificada por la EPA con métodos seguros, y a usted le deben entregar el folleto Renovate Right antes de empezar. Pídale a cualquier contratista, también a nosotros, que le enseñe primero el certificado de la empresa. La [página de la EPA sobre la regla RRP](https://www.epa.gov/lead/renovation-repair-and-painting-program) la explica en detalle." },
          { q: "¿Tengo que avisar antes de excavar para una terraza, cerca o ampliación?", a: "Sí. La ley de Alabama obliga a cualquiera que vaya a excavar, también a los dueños de casa, a avisar a Alabama 811 por lo menos dos días hábiles completos antes. Es gratis: marque 811 o 800-292-8525, o haga la solicitud en [al811.com](https://al811.com), y las compañías de servicios marcan sus líneas enterradas. Si su proyecto incluye excavar, asegúrese de que se hizo la solicitud antes de la primera palada." },
        ],
      },
      {
        id: "during-the-job", audience: "home", h: "Mientras se hace la obra",
        intro: "Cómo es de verdad vivir con una obra en casa, y qué pasa si aparece una sorpresa.",
        qs: [
          { q: "¿Puedo seguir viviendo en mi casa durante la remodelación?", a: "Casi siempre sí. Con pintura, pisos y la mayoría de los trabajos de baño se puede vivir normal, y durante una [remodelación de cocina](service:kitchen) muchas familias arman una cocinita temporal con el refrigerador y el microondas. Si su casa tiene un solo baño, díganos y organizamos el orden del trabajo para que no se quede sin él." },
          { q: "¿A qué horas va a estar la cuadrilla en mi casa?", a: "Antes de empezar acordamos la hora de llegada y de salida, y la respetamos. Díganos si hay algo que debamos cuidar, como la siesta del bebé, un turno de noche o alguien que trabaja desde casa. Si algo cambia, le llamamos; nunca lo dejamos con la duda." },
          { q: "¿Y mis mascotas y mis hijos?", a: "Lo mejor es tener a las mascotas en un cuarto cerrado o lejos del área de trabajo, porque habrá puertas abiertas, herramientas, pintura y escombro. Cuéntenos de sus mascotas y sus niños en la visita y preparamos el área de trabajo pensando en ellos." },
          { q: "¿Cuánto polvo y desorden va a haber?", a: "Pintar y poner piso deja poco polvo; lijar, trabajar tablaroca y demoler dejan más. Ponemos barreras contra el polvo, protegemos los pisos y limpiamos todos los días. En una casa de antes de 1978, el polvo de pintura vieja necesita manejo seguro contra el plomo, como explicamos en la pregunta sobre el plomo." },
          { q: "¿Cuánto tiempo va a tardar mi proyecto?", a: "Tiempos típicos en obra: pintura interior de 2 a 7 días en la mayoría de las casas, pisos nuevos de 1 a 5 días, pintura de gabinetes de 3 a 7 días, una [remodelación de baño](service:bathroom) de 2 a 4 semanas y una cocina de 2 a 6 semanas. Las ampliaciones tardan más y empiezan después de los permisos. Su presupuesto por escrito trae un tiempo realista para su obra." },
          { q: "¿Qué pasa si encuentran un problema dentro de una pared?", a: "Paramos, se lo enseñamos y le explicamos sus opciones con un precio por escrito antes de arreglar nada. En casas viejas, muy comunes en Opelika y en el campo del [condado de Lee](area:lee-county), las sorpresas más comunes son madera podrida, tubería galvanizada vieja o cableado anticuado. Usted se entera primero y usted decide; nada se agrega a la cuenta sin su firma." },
          { q: "¿La lluvia o el calor retrasan la pintura exterior?", a: "Puede pasar. La pintura necesita una superficie seca y la temperatura adecuada, así que movemos los días de trabajo exterior según la lluvia y la humedad, en lugar de pintar en malas condiciones. En el condado de Lee, el otoño suele ser la mejor temporada. Nuestra [guía de cuándo pintar por fuera](guide:exterior-paint-timing) explica por qué." },
          { q: "¿Tengo que mover los muebles o empacar el cuarto?", a: "Su presupuesto dice quién mueve qué, así que pregúntelo en la visita. De todas formas ayuda mucho guardar las cosas chicas, lo de valor y lo que se pueda romper antes de que llegue la cuadrilla, y dejar libre el paso al área de trabajo." },
        ],
      },
      {
        id: "after", audience: "home", h: "Cuando se termina la obra",
        intro: "El recorrido final, los papeles que conviene guardar y qué hacer si algo no quedó bien.",
        qs: [
          { q: "¿Qué es la lista de pendientes (punch list)?", a: "Es la lista de detalles chicos que quedan al final: una gota de pintura, una tapa de enchufe que falta, una puerta que se atora. Antes de dar la obra por terminada la recorremos con usted, anotamos todo y lo terminamos. El último pago se hace después de ese recorrido." },
          { q: "¿Hay garantía?", a: "Pídale a cualquier contratista que ponga por escrito la garantía de mano de obra antes de firmar: qué cubre, por cuánto tiempo y cómo hacerla válida. Materiales como pisos, pintura y accesorios muchas veces tienen su propia garantía del fabricante, aparte de la mano de obra. Guarde las dos junto con su contrato." },
          { q: "¿Qué me deben dar cuando hago el último pago?", a: "Una factura final con lo que pagó, los papeles de garantía y, en obras grandes, una liberación de gravamen (lien release): un documento que dice que quienes pusieron trabajo o material ya cobraron y no van a reclamar contra su casa. La FTC recomienda pedirla con el último pago. Nuestra [guía para verificar a un contratista](guide:hire-contractor) explica más." },
          { q: "¿Qué hago si algo no quedó bien después de que se fueron?", a: "Llame o mande mensaje al dueño primero y lo arreglamos. Cuéntenos qué ve y, si puede, mande una foto, para llegar con el material correcto." },
          { q: "¿Me puedo quedar con la pintura que sobra para retoques?", a: "Sí, pídanos que le dejemos la pintura sobrante con etiqueta. Anote la marca, el nombre del color y el brillo (sheen), es decir, qué tan brillante es el acabado, para que un retoque futuro combine. Guarde los botes dentro de la casa, lejos del frío y del calor." },
          { q: "¿Cómo dejo una reseña?", a: "En Google, Angi o HomeAdvisor, la que ya use; en nuestra [página de reseñas](page:reviews) están los enlaces. Dos minutos de su tiempo son la forma en que la siguiente familia de su calle encuentra un contratista de confianza." },
        ],
      },
      {
        id: "language", audience: "home", h: "En español, en inglés o en los dos",
        intro: "Toda la obra puede ser en el idioma en que usted se sienta más a gusto.",
        qs: [
          { q: "¿Puedo hacer todo el proyecto en español?", a: "Sí. La visita, el presupuesto por escrito, el contrato, las llamadas y los mensajes por WhatsApp pueden ser en español, de principio a fin. Nuestra [guía para contratar en español](guide:bilingual-contractor) explica qué preguntarle a cualquier contratista." },
          { q: "¿Les puedo escribir por WhatsApp?", a: "Sí. Mándenos fotos del proyecto por WhatsApp y le contestamos con los siguientes pasos, en español o en inglés. Muchas veces es la forma más fácil de enseñarnos un problema; el número está en nuestra [página de contacto](page:contact)." },
          { q: "¿El presupuesto y el contrato pueden venir en español?", a: "Si lo prefiere, sí, y también cada orden de cambio. Nunca debería firmar algo que no pueda leer con tranquilidad." },
          { q: "En mi familia unos hablan español y otros inglés. ¿Pueden atendernos a todos?", a: "Sí. Aquí es muy común, así que podemos mantener a una persona al tanto en español y a otra en inglés, o poner a todos en los mismos mensajes." },
        ],
      },
      /* ------------------------------------------------ NEGOCIOS */
      {
        id: "landlords", audience: "business", h: "Arrendadores y dueños de casas de renta",
        intro: "Cambios de inquilino según el calendario de rentas de Auburn, para dueños que viven cerca o lejos.",
        qs: [
          { q: "¿Cuándo debo apartar el cambio de inquilino antes de las mudanzas del verano en Auburn?", a: "En la primavera. En Auburn casi todos los contratos terminan y empiezan en las mismas semanas del verano, así que las cuadrillas y el material se apartan temprano. Mándenos las fechas de salida y entrada y organizamos el trabajo para que quepa. Vea [casas de renta](service:rental)." },
          { q: "¿Cuánto tarda preparar una casa de renta?", a: "La mayoría tarda de 2 a 10 días, según cómo quedó. Una casa típica de 3 dormitorios con piso LVP nuevo toma de 2 a 4 días, y la pintura se puede hacer al mismo tiempo. Nuestra [guía de cambio de inquilino](guide:rental-turnover) muestra el orden de trabajo que lo hace más rápido." },
          { q: "¿Cuánto cuesta preparar una casa de renta?", a: `Un cambio ligero (pintura, resanes y reparaciones) suele costar ${mid("rental", 0)}, uno mediano con LVP y accesorios nuevos ${mid("rental", 1)}, y uno fuerte con arreglos de cocina o baño ${mid("rental", 2)} por casa. Los daños de mascotas y la falta de mantenimiento pesan más que el tamaño. Si son varias casas o un acuerdo fijo de cambios, el costo por casa baja.` },
          { q: "Vivo fuera de Auburn. ¿Cómo sé que el trabajo quedó?", a: "Recibe fotos del antes y el después de cada cuarto, una factura detallada que puede pasarle a su contador y, si lo pide, un video del recorrido. Díganos cómo quiere manejar la entrada, con caja de llaves (lockbox), con su administrador o con un vecino, y nos ajustamos. Usted tiene una sola persona a quien llamar." },
          { q: "¿Pueden trabajar mientras el inquilino todavía vive ahí?", a: "Muchas veces sí, sobre todo en reparaciones. Usted o su administrador acuerdan la entrada y le dan al inquilino el aviso que piden el contrato y la ley de Alabama; nosotros llegamos en el horario que ustedes fijen y dejamos el área de trabajo ordenada." },
          { q: "Compramos un condominio para nuestro hijo que estudia. ¿Qué debemos planear?", a: "Organice el año según el contrato: el cambio de inquilino se aparta en primavera, las reparaciones chicas se hacen en las vacaciones de la escuela, y una revisión al año del aire acondicionado, el calentador de agua, los detectores de humo y el sellador. Nuestra [guía de condominios para estudiantes](guide:student-condo) trae el calendario completo." },
          { q: "¿Qué acabados aguantan mejor en una casa de renta?", a: "Piso LVP a prueba de agua en lugar de alfombra, pintura resistente que se retoca bien, y los mismos colores y brillos en todas las casas para que los retoques siempre combinen. Nuestra [guía de pisos](guide:flooring-humidity) compara cuáles aguantan mejor la humedad, las mascotas y los inquilinos." },
        ],
      },
      {
        id: "property-managers", audience: "business", h: "Administradores de propiedades",
        intro: "Órdenes de trabajo, facturación y papeles para quienes contratan cada mes.",
        qs: [
          { q: "¿Pueden trabajar con nuestras órdenes de trabajo?", a: "Sí. Podemos trabajar directamente con la orden de trabajo del administrador y facturarle al dueño o a la administradora, como usted prefiera. Vea cómo trabajamos las [casas de renta](service:rental)." },
          { q: "¿Nos pueden mandar un certificado de seguro?", a: "Sí. Tenemos seguro de responsabilidad civil general, y el certificado de seguro (COI) está disponible a solicitud antes de empezar. Si su empresa pide una cobertura o una redacción específica, mándenos los requisitos y le decimos claramente si podemos cumplirlos." },
          { q: "¿Qué tan rápido responden?", a: "Contestamos en un día hábil. Qué tan pronto podemos empezar depende de la temporada: el verano en Auburn es lo más apretado, así que conviene apartar los cambios de inquilino en primavera. Si tiene trabajo seguido, cuéntenos lo que viene y lo planeamos juntos." },
          { q: "¿Pueden encargarse de varias casas o de toda una cartera?", a: "Sí. Con varias casas o un acuerdo fijo de cambios, el costo por casa baja, y usamos los mismos colores, brillos y líneas de LVP para que todas combinen y las reparaciones futuras sean sencillas." },
          { q: "¿Qué documentación entregan?", a: "Alcance y precio por escrito para cada casa, fotos del antes y el después, y facturas detalladas que puede pasarle al dueño o al contador." },
        ],
      },
      {
        id: "realtors-sellers", audience: "business", h: "Agentes, vendedores e inversionistas",
        intro: "Dejar una casa lista para vender y resolver la lista de la inspección antes del cierre.",
        qs: [
          { q: "¿Qué conviene arreglar antes de poner una casa en venta?", a: "Casi siempre, pintura nueva en color neutro, pisos gastados y los detalles chicos que el comprador nota: puertas que se atoran, molduras dañadas, tapas que faltan, sellador manchado. Cuestan poco comparado con lo que mejoran la primera impresión. Hacemos listas de pendientes antes de vender; empiece por [pintura](service:painting)." },
          { q: "¿Pueden encargarse de la lista de reparaciones de la inspección del comprador?", a: "Mándenos el reporte de la inspección. Le cotizamos por escrito las [reparaciones](service:repairs) que nos tocan y le decimos claramente qué puntos necesitan otro oficio, para que nada se quede sin resolver antes del cierre." },
          { q: "¿Qué tan rápido pueden trabajar antes de la fecha de cierre?", a: "Muchas reparaciones toman de 1 a 3 días y la pintura interior de 2 a 7 días en la mayoría de las casas. Mándenos la fecha de cierre en cuanto la tenga, porque cualquier cosa que lleve permiso toma más tiempo." },
          { q: "¿Qué mejoras rinden más en una casa de constructor para vender o rentar?", a: "Pintar todo el interior en un neutro moderno, pintar los gabinetes con jaladeras nuevas, LVP en lugar de alfombra, lámparas nuevas y renovar el baño son lo que más rinde por cada dólar. Nuestra [guía de mejoras para casas de constructor](guide:builder-grade-upgrades) las ordena con precios de Auburn." },
        ],
      },
      {
        id: "hoa-condo", audience: "business", h: "HOA, condominios y otros trabajos",
        intro: "Aprobaciones de la mesa directiva, reglas de condominio y si un trabajo es para nosotros.",
        qs: [
          { q: "Somos la mesa directiva de una HOA o condominio. ¿Trabajan en áreas comunes?", a: "Pregúntenos. Nos enfocamos en casas y propiedades de renta, así que cuéntenos el alcance y le decimos claramente si es un trabajo para nuestra cuadrilla." },
          { q: "¿Cómo funciona la aprobación de la HOA o del comité (ARC) para la obra de un vecino?", a: "El dueño presenta el plan a la mesa directiva o al comité de revisión antes de cualquier trabajo exterior. Nosotros preparamos las muestras de color, los planos y las especificaciones para la solicitud, y empezamos solo cuando la aprobación está por escrito." },
          { q: "¿Qué debo saber antes de remodelar un condominio?", a: "Primero consiga las reglas de su asociación: horarios de trabajo, estacionamiento, uso del elevador, ruido y dónde se puede dejar el escombro. La regla de licencia de la HBLB de Alabama para obras de más de $10,000 también aplica a los condominios. Compártanos las reglas antes del presupuesto para que el precio y el calendario las tomen en cuenta." },
          { q: "¿Hacen trabajos comerciales chicos, como oficinas o locales?", a: "Nos enfocamos en casas y propiedades de renta. Si tiene un trabajo comercial chico, [llámenos o escríbanos](page:contact) y cuéntenos; le decimos claramente si es para nosotros." },
        ],
      },
    ],
    localH: "Auburn y Opelika: a quién llamar para qué",
    localP: "Auburn y Opelika están una junto a la otra, pero muchos servicios funcionan distinto. Aquí está quién se encarga de qué en una obra en casa. Revisado en septiembre de 2026; confirme los detalles para su dirección.",
    localCols: ["", "Auburn", "Opelika"],
    local: [
      { label: "Permisos de construcción", auburn: "Inspection Services de la ciudad de Auburn, 171 N. Ross St. (334) 501-3170", opelika: "Building Inspection Division de Opelika, 710 Fox Trail (Public Works). (334) 705-5420", note: "Fuera de los límites de la ciudad, los permisos los da el condado de Lee." },
      { label: "Zonas históricas", auburn: "North College Historic District", opelika: "Northside, el centro (Downtown), Geneva Street y Pepperell Mill & Village", note: "Los cambios exteriores en una zona histórica local necesitan un Certificado de Conformidad." },
      { label: "Electricidad", auburn: "Casi todo Alabama Power; algunas zonas, Tallapoosa River Electric Cooperative o Dixie Electric Cooperative", opelika: "Opelika Power Services, de la ciudad; algunas zonas, Alabama Power o Tallapoosa River Electric Cooperative", note: "Revise su recibo; la compañía depende de su dirección." },
      { label: "Gas natural", auburn: "Spire", opelika: "Spire o Southeast Gas" },
      { label: "Agua y drenaje", auburn: "Agua: Water Works Board de la ciudad de Auburn. Drenaje: ciudad de Auburn (Water Resource Management)", opelika: "Agua: Opelika Utilities. Drenaje: Public Works de la ciudad de Opelika" },
      { label: "Escombro de la obra", auburn: "No se lo lleva la recolección de basura voluminosa; el material de construcción está excluido", opelika: "No se lo llevan; quien hace la obra debe sacar el escombro", note: "Pregúntele a su contratista si llevarse el escombro está incluido en el precio." },
      { label: "Antes de excavar", auburn: "Alabama 811: marque 811 o 800-292-8525, o al811.com", opelika: "Igual: Alabama 811", note: "Gratis. Por lo menos dos días hábiles completos antes de excavar." },
      { label: "Registros de la propiedad", auburn: "Revenue Commissioner y Juez de Probate del condado de Lee, Lee County Courthouse, 215 S. 9th St., Opelika", opelika: "Las mismas oficinas del condado", note: "Sirven para ver el nombre del dueño, escrituras e impuestos." },
    ],
    glossaryH: "Palabras que va a oír en la obra",
    glossaryP: "Definiciones sencillas de los términos que aparecen en presupuestos, contratos y en la obra. Entre paréntesis, la palabra en inglés que quizá escuche.",
    glossary: [
      { term: "Alcance del trabajo (scope of work)", def: "La lista por escrito de exactamente lo que se va a hacer y lo que no. Si no está en el alcance, no está en el precio." },
      { term: "Presupuesto por escrito (estimate)", def: "El precio en papel, desglosado, con el alcance y los tiempos. Es el número que puede comparar y que el contratista debe respetar." },
      { term: "Orden de cambio (change order)", def: "Un cambio al contrato, por escrito y firmado, con el precio y el tiempo nuevos, acordado antes de hacer el trabajo extra." },
      { term: "Depósito (deposit)", def: "El primer pago, normalmente para apartar fechas y comprar material. Debe ser una parte del precio, no toda la obra." },
      { term: "Pago parcial (draw)", def: "Un pago que se hace al terminar una etapa acordada, como la demolición, las instalaciones o la colocación de gabinetes." },
      { term: "Asignación (allowance)", def: "Una cantidad fija en el presupuesto para cosas que todavía no escoge, como azulejo o lámparas. Si escoge algo más caro, paga la diferencia." },
      { term: "Liberación de gravamen (lien release o lien waiver)", def: "Un documento que dice que el contratista, un subcontratista o un proveedor ya cobró y no va a reclamar contra su casa. Pídala con los pagos, sobre todo con el último." },
      { term: "Permiso (permit)", def: "La autorización de la ciudad o el condado para ciertos trabajos, como plomería, electricidad, cambios de estructura o ampliaciones." },
      { term: "Inspección (inspection)", def: "La visita del inspector de la ciudad o el condado para revisar que la obra con permiso cumpla el código antes de taparla o terminarla." },
      { term: "Lista de pendientes (punch list)", def: "La lista final de detalles chicos que se encuentran en el último recorrido, y que se terminan antes de dar la obra por cerrada." },
      { term: "Certificado de seguro (COI)", def: "Una hoja de la aseguradora del contratista que comprueba que su seguro está vigente." },
      { term: "Licencia HBLB", def: "La licencia de la Home Builders Licensure Board de Alabama, obligatoria para obras residenciales de más de $10,000 entre mano de obra y material." },
      { term: "Preparación entre inquilinos (make-ready o turnover)", def: "Dejar una casa de renta lista para el siguiente inquilino: reparaciones, pintura, pisos y limpieza." },
      { term: "Piso LVP (luxury vinyl plank)", def: "Tablas de vinil a prueba de agua y muy resistentes que parecen madera. Muy usado en rentas y en casas con niños y mascotas." },
      { term: "Primer o sellador (primer)", def: "La primera mano que ayuda a que la pintura se pegue y tapa manchas y resanes. Saltárselo es la razón por la que se pela la pintura barata." },
      { term: "Brillo (sheen)", def: "Qué tan brillante es la pintura: mate (flat o matte), cascarón (eggshell), satinado (satin), semibrillante (semi-gloss) y brillante (gloss). Entre más brillo, más fácil de limpiar, pero se notan más las imperfecciones." },
      { term: "Tablaroca (drywall o sheetrock)", def: "Los paneles con los que se hacen casi todas las paredes y techos interiores." },
      { term: "Contrapiso (subfloor)", def: "La capa de estructura que va debajo del piso terminado. Si está blanda o podrida, hay que arreglarla antes de poner piso nuevo." },
      { term: "Enchufe GFCI (tomacorriente)", def: "Un enchufe con botones de prueba y reinicio que corta la corriente en una fracción de segundo si detecta riesgo de descarga. Es obligatorio cerca del agua." },
      { term: "Instalaciones en obra negra (rough-in)", def: "La etapa en que se pasan tubos, cables y ductos nuevos dentro de las paredes abiertas, antes de la inspección y de la tablaroca." },
      { term: "Aprobación de la HOA o del ARC", def: "El permiso por escrito de la asociación de vecinos o de su comité de revisión para hacer cambios por fuera." },
      { term: "RRP (trabajo seguro con plomo)", def: "La regla federal de la EPA para trabajos pagados que tocan pintura en casas de antes de 1978: empresa certificada, métodos seguros y limpieza cuidadosa." },
    ],
    stillH: "¿Le quedó alguna duda?",
    stillP: "Pregúntenos directamente. Llame, mande mensaje o WhatsApp, o llene el formulario corto, en español o en inglés, y le contestamos en un día hábil.",
  },
};
