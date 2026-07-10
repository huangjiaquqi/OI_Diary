export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[d.getDay()];
  return `${year}年${month}月${day}日 周${weekDay}`;
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}