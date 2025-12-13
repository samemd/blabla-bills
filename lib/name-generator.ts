import { Config, adjectives, uniqueNamesGenerator } from 'unique-names-generator';

const meetingSynonyms = [
    'Meeting',
    'Sync',
    'Huddle',
    'Standup',
    'Check-in',
    'Catch-up',
    'Discussion',
    'Brainstorm',
    'Workshop',
    'Session',
    'Gathering',
    'Conference',
    'Assembly',
    'Summit',
    'Talk',
    'Chat',
    'Powwow',
    'Conclave',
    'Forum',
    'Roundtable',
    'Symposium',
    'Colloquium',
    'Panel',
    'Debrief',
    'Briefing',
    'Consultation',
    'Dialogue',
    'Discourse',
    'Exchange',
    'Interaction',
    'Negotiation',
    'Deliberation',
    "Refinement",
    'Planning',
];

const customConfig: Config = {
    dictionaries: [adjectives, adjectives, meetingSynonyms],
    separator: ' ',
    style: 'capital',
};

export function generateName() {
    return uniqueNamesGenerator(customConfig)
}

