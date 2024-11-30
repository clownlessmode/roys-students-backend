export default function generateLogin(
  firstName: string,
  lastName: string,
  patronymic: string,
  groupCode: string,
): string {
  const cyrillicToLatinMap: { [key: string]: string } = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'j',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    А: 'A',
    Б: 'B',
    В: 'V',
    Г: 'G',
    Д: 'D',
    Е: 'E',
    Ё: 'YO',
    Ж: 'ZH',
    З: 'Z',
    И: 'I',
    Й: 'J',
    К: 'K',
    Л: 'L',
    М: 'M',
    Н: 'N',
    О: 'O',
    П: 'P',
    Р: 'R',
    С: 'S',
    Т: 'T',
    У: 'U',
    Ф: 'F',
    Х: 'H',
    Ц: 'C',
    Ч: 'CH',
    Ш: 'SH',
    Щ: 'SCH',
    Ъ: '',
    Ы: 'Y',
    Ь: '',
    Э: 'E',
    Ю: 'YU',
    Я: 'YA',
  };

  const transliterate = (text: string): string =>
    text
      .split('')
      .map((char) => cyrillicToLatinMap[char] || char)
      .join('');

  const firstInitial = transliterate(firstName.charAt(0)).toLowerCase();
  const lastNamePart = transliterate(lastName).toLowerCase().slice(0, 3);
  const patronymicPart = transliterate(patronymic).toLowerCase().slice(0, 3);
  const groupCodeDigits = groupCode.replace(/\D/g, '');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${firstInitial}${lastNamePart}${patronymicPart}${groupCodeDigits}-${randomDigits}`;
}
