export function formatDate(date) {
  return date.getFullYear() + "." +
        (date.getMonth() < 10 ? "0" : "") +
        date.getMonth() + "." +
        (date.getDate() < 10 ? "0" : "") +
        date.getDate() + ". " +
        date.getHours() + ":" +
        (date.getMinutes() < 10 ? "0" : "") +
        date.getMinutes();
}
