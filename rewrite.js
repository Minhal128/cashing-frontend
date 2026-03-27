const fs = require('fs');
const path = 'c:/Users/Asus/Desktop/Development/caching/cashingfrontend/components/Modal/FundsModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(/\/\/ Import icons[\s\S]*?import VenmoIcon.*?;\n/, '');

const svgs = 
const CardSvgIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" />
  </svg>
);

const CashAppSvgIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M13.5 9H10.5C9.67157 9 9 9.67157 9 10.5C9 11.3284 9.67157 12 10.5 12H13.5C14.3284 12 15 12.6716 15 13.5C15 14.3284 14.3284 15 13.5 15H10.5" />
    <path d="M12 7V17" />
  </svg>
);

const VenmoSvgIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M13.882 17.618C13.623 18.966 12.593 20 11.235 20H8.382L9.206 14.941L5 4H8.765L11.588 11.647C12.353 9.412 13.471 7.824 14.941 6.765C17.059 5.235 19.353 5 19.353 5C19.353 5 20.353 5 20.353 6.059C20.353 7.824 19.824 10.529 18.706 13C17.647 15.353 15.412 16.882 13.882 17.618Z" />
  </svg>
);
;

content = content.replace(/type Step =.*?\n/, (match) => match + '\n' + svgs);

content = content.replace(/icon: CardIcon,\s*iconType: 'image',/g, "icon: CardSvgIcon,\n    iconType: 'component',");
content = content.replace(/icon: CashAppIcon,\s*iconType: 'image',/g, "icon: CashAppSvgIcon,\n    iconType: 'component',");
content = content.replace(/icon: VenmoIcon,\s*iconType: 'image',/g, "icon: VenmoSvgIcon,\n    iconType: 'component',");

fs.writeFileSync(path, content);
console.log('Updated elements');
