const addMinutes = (time, mins) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m + mins, 0);
  return date.toTimeString().slice(0, 5);
};

module.exports = function generateSlots(
  startTime,
  endTime,
  breakStart,
  breakEnd,
  duration
) {
  const slots = [];
  let current = startTime;
  let token = 1;

  while (current < endTime) {
    const next = addMinutes(current, duration);

    // Skip break time
    if (current >= breakStart && current < breakEnd) {
      current = breakEnd;
      continue;
    }

    if (next > endTime) break;

    slots.push({
      tokenNumber: token,
      start: current,
      end: next
    });

    token++;
    current = next;
  }

  return slots;
};
