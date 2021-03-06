import { getEvents, EventDetails } from "./events.js";
const { slugify } = require("../services/slug.js");

export const getSpeakers = () => {
  return getEvents()
    .map(e => {
      return e.presentations.map(p => {
        return { ...p, selfLink: e.selfLink, slug: slugify(p.name) };
      });
    })
    .flat();
};

type SpeakerProfilePresentation = { title: string; selfLink: string };

type SpeakerProfile = {
  name: string;
  slug: string;
  presentations: SpeakerProfilePresentation[];
  presentationsCount: number;
};

export const getSpeakerProfiles = (): SpeakerProfile[] => {
  const events: EventDetails[] = getEvents();

  // we create a speakerprofile for every single presentation
  const speakerprofiles = events
    .map(event => {
      const { presentations, selfLink } = event;
      const profiles = presentations.map(presentation => {
        return {
          name: presentation.name,
          slug: slugify(presentation.name),
          presentations: [{ title: presentation.title, selfLink }]
        };
      });
      return profiles;
    })
    .flat();

  // then we combine the speakerprofiles based on the name
  const groupByName = speakerprofiles.reduce((accumulator, current) => {
    // if the profile already exist
    if (accumulator.hasOwnProperty(current.name)) {
      // combine the new presentations with the new
      // using concat since we have two arrays
      accumulator[current.name].presentations = accumulator[
        current.name
      ].presentations.concat(current.presentations);
    } else {
      // the profile does not exist
      // so we create a new
      accumulator[current.name] = current;
    }
    return accumulator;
  }, {});

  // return an array with speakerprofiles
  // that has multiple presentations
  const speakerProfiles: SpeakerProfile[] = Object.values(groupByName);

  speakerProfiles.forEach(speakerProfile => {
    speakerProfile.presentationsCount = speakerProfile.presentations.length;
  });

  return speakerProfiles;
};

export const getSpeakerProfile = (slug): SpeakerProfile | undefined => {
  return getSpeakerProfiles().find(
    speakerProfile => speakerProfile.slug === slug
  );
};
