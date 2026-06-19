const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const languages = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory());

const newKeys = {
  "upload": {
    "drag_drop": {
      "en": "Drag & Drop your file here",
      "ar": "اسحب وأفلت ملفك هنا"
    },
    "or_click": {
      "en": "or click to browse",
      "ar": "أو انقر للتصفح"
    },
    "limit_exceeded": {
      "en": "File size exceeds your plan's limit ({{limit}}MB). Please upgrade to {{plan}} to process this file.",
      "ar": "حجم الملف يتجاوز الحد المسموح في خطتك ({{limit}}MB). يرجى الترقية إلى خطة {{plan}} لمعالجة هذا الملف."
    },
    "access_denied": {
      "en": "Access denied. Please upgrade to {{plan}} to use this tool.",
      "ar": "تم رفض الوصول. يرجى الترقية إلى خطة {{plan}} لاستخدام هذه الأداة."
    }
  }
};

languages.forEach(lang => {
  const file3 = path.join(localesDir, lang, 'locales3.json');
  if (fs.existsSync(file3)) {
    let data = JSON.parse(fs.readFileSync(file3, 'utf8'));
    
    // Add upload keys
    if (!data.upload) data.upload = {};
    data.upload.drag_drop = newKeys.upload.drag_drop[lang] || newKeys.upload.drag_drop.en;
    data.upload.or_click = newKeys.upload.or_click[lang] || newKeys.upload.or_click.en;
    data.upload.limit_exceeded = newKeys.upload.limit_exceeded[lang] || newKeys.upload.limit_exceeded.en;
    data.upload.access_denied = newKeys.upload.access_denied[lang] || newKeys.upload.access_denied.en;

    fs.writeFileSync(file3, JSON.stringify(data, null, 2));
  }
});

console.log('Updated locales3.json for all languages.');
