/*******************************************************************************
 * ΦΩΝΗΤΙΚΗ ΠΛΗΚΤΡΟΛΟΓΗΣΗ → GOOGLE DOCS  —  Code.gs
 * Ο κώδικας για το Google Apps Script project (Επεκτάσεις → Apps Script).
 *
 * ΤΙ ΚΑΝΕΙ:
 *   • doPost()  : Δέχεται το κείμενο από τη σελίδα (fetch POST) και το γράφει
 *                 ως νέα παράγραφο στο τέλος του εγγράφου.
 *   • doGet()   : Σερβίρει τη σελίδα (index.html) στο URL του Web App,
 *                 και δέχεται και γρήγορο test:  …/exec?text=Καλημέρα
 *   • appendToDoc() : Καλείται απευθείας από τη σελίδα όταν τρέχει ΜΕΣΑ
 *                 στο Apps Script (google.script.run).
 *   • testSetup(): Τρέξτε το μία φορά από τον editor (▶) για εξουσιοδότηση
 *                 και επιβεβαίωση ότι όλα λειτουργούν.
 *
 * ΑΝΑΠΤΥΞΗ (Deployment):
 *   1. Ανάπτυξη → Νέα ανάπτυξη → Τύπος: Web app
 *   2. Εκτέλεση ως: Εμένα  |  Πρόσβαση: Όλοι
 *   3. Αντιγράψτε το URL που τελειώνει σε /exec και επικολλήστε το
 *      στα «⚙ Ρυθμίσεις» της σελίδας.
 *   ⚠ Μετά από κάθε αλλαγή κώδικα: Ανάπτυξη → Διαχείριση αναπτύξεων →
 *     ✏️ → Έκδοση: Νέα έκδοση → Ανάπτυξη.
 ******************************************************************************/

/* >>> Το ID του Google Doc (από το URL του εγγράφου σας) <<< */
const DOC_ID = '1sGCFAKr0Le4mc0KPCgNyo9GbYa0OIL1EV0b45H_GT2E';

/**
 * Web App entry — σερβίρει τη σελίδα και δέχεται γρήγορο test με GET:
 *   https://…/exec?text=Καλημέρα
 */
function doGet(e) {
  // GET fallback για γρήγορο test από τον browser
  if (e && e.parameter && e.parameter.text) {
    return json_(appendTextInput(e.parameter.text));
  }

  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Φωνητική Πληκτρολόγηση')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Web App entry — δέχεται POST με JSON: { "text": "…" }
 * (Η σελίδα στέλνει με Content-Type: text/plain ώστε να αποφεύγεται
 *  το CORS preflight — το body παραμένει JSON string.)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    return json_(appendTextInput(data.text || ''));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * Καλείται απευθείας από τη σελίδα όταν τρέχει ΜΕΣΑ στο Apps Script:
 *   google.script.run.withSuccessHandler(…).appendToDoc(text)
 */
function appendToDoc(text) {
  return json_(appendTextInput(text));
}

/** Ο πυρήνας: προσθέτει το κείμενο ως νέα παράγραφο στο τέλος του εγγράφου */
function appendTextInput(text) {
  try {
    const clean = String(text || '').trim();
    if (!clean) {
      return { ok: false, error: 'Κενό κείμενο — δεν γράφτηκε τίποτα.' };
    }
    const body = DocumentApp.openById(DOC_ID).getBody();
    body.appendParagraph(clean);
    return { ok: true, chars: clean.length };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** Τρέξτε το μία φορά από τον editor (▶) → ζητά εξουσιοδότηση και δοκιμάζει */
function testSetup() {
  const res = appendTextInput('✔ Το Apps Script συνδέθηκε επιτυχώς με το έγγραφο!');
  Logger.log(JSON.stringify(res));
  if (!res.ok) {
    throw new Error(res.error);
  }
}

/** Εσωτερικό: ενσωμάτωση αρχείων HTML (index, script) στο template */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** Εσωτερικό: JSON απάντηση */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
