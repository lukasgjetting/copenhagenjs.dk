jest.mock("../models/attendance");
jest.mock("../models/events");
import {
  getUserAttendanceRaw,
  AttendanceStatus,
  Attendance
} from "../models/attendance";
import { UserEvents, uniqueEventsFromAttendance } from "./userevents";
import { memGetSingleEvent, EventDetails } from "../models/events";
const mockedGetUserAttendance = getUserAttendanceRaw as jest.MockedFunction<
  typeof getUserAttendanceRaw
>;
const mockedMemGetSingleEvent = memGetSingleEvent as jest.MockedFunction<
  typeof memGetSingleEvent
>;

test("UserEvents defined", () => {
  expect(UserEvents).toBeDefined();
});

test("UserEvent should call attendance", async () => {
  const attendanceHistory: Attendance[] = [
    {
      userId: "123",
      status: AttendanceStatus.GOING,
      timestamp: new Date().toString(),
      eventSlug: "first"
    },
    {
      userId: "123",
      status: AttendanceStatus.GOING,
      timestamp: new Date().toString(),
      eventSlug: "third"
    }
  ];
  mockedGetUserAttendance.mockResolvedValue(attendanceHistory);
  const allEvents: EventDetails[] = [
    { slug: "first", date: new Date(), presentations: [] },
    { slug: "second", date: new Date(), presentations: [] },
    { slug: "third", date: new Date(), presentations: [] }
  ];
  mockedMemGetSingleEvent.mockImplementation(slugId =>
    allEvents.find(i => i.slug === slugId)
  );
  const events = await UserEvents({}, {}, { token: { user_id: "123" } });
  expect(memGetSingleEvent).toBeCalledWith(attendanceHistory[0].eventSlug);
  expect(getUserAttendanceRaw).toBeCalled();
  expect(events).toEqual([allEvents[0], allEvents[2]]);
});

test("last attendance for each event", () => {
  const attendanceHistory: Attendance[] = [
    {
      userId: "123",
      status: AttendanceStatus.NOTGOING,
      timestamp: new Date().toString(),
      eventSlug: "first"
    },
    {
      userId: "123",
      status: AttendanceStatus.GOING,
      timestamp: new Date().toString(),
      eventSlug: "first"
    },
    {
      userId: "123",
      status: AttendanceStatus.NOTGOING,
      timestamp: new Date().toString(),
      eventSlug: "second"
    }
  ];

  expect(uniqueEventsFromAttendance(attendanceHistory)).toEqual([
    attendanceHistory[1],
    attendanceHistory[2]
  ]);
});
