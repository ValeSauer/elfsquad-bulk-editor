# Feature Tag Editor – Anforderungsspezifikation

## 1. Zweck

Eine Web-App, um Tags für Features in einer hierarchischen Feature-Struktur (Tree) anzuzeigen, zu bearbeiten und in Bulk zu verwalten – mit direkter Anbindung an die Elfsquad API.

---

## 2. Datenmodell & Endpunkte (Elfsquad Standard)

### Feature  
**Endpunkte:**  
- `GET /Features`  
- `GET /Features/{id}`  
- `PATCH /Features/{id}`

**Struktur:**  
```
{
  "id": "string",
  "name": "string",
  "reference": "string",
  "articleCode": "string",
  "salesPrice": number,
  "tags": ["string"], // Maximal 5 Tags pro Feature, nur Buchstaben und Zahlen erlaubt
  "_meta": {
    "etag": "string",
    "updatedAt": "string"
  }
}
```

### FeatureModel  
**Endpunkt:**  
- `GET /FeatureModels`

**Struktur:**  
```
{
  "id": "string",
  "reference": "string",
  "rootFeatureId": "string"
}
```

### FeatureModelNode  
**Endpunkt:**  
- `GET /FeatureModelNodes?$filter=featureModelId eq <id>`

**Struktur:**  
```
{
  "id": "string",
  "featureId": "string",
  "featureModelId": "string",
  "parentId": "string"
}
```

### FeatureModelRelationship  
**Endpunkt:**  
- `GET /FeatureModelRelationships?$filter=featureModelId eq <id>`

**Struktur:**  
```
{
  "id": "string",
  "featureModelId": "string",
  "fromNodeId": "string",
  "toNodeId": "string",
  "order": number
}
```

---

## 3. UI-Anforderungen

### 3.1. Hauptansicht
- Tree-Ansicht aller Feature-Modelle und ihrer Nodes (hierarchisch, aufklappbar)
- Jede Zeile zeigt:
  - Feature-ID, Article Code, Reference, Name, Sales Price, Tags (als Multi-Select)
  - Checkbox für Auswahl (für Bulk-Aktionen)

### 3.2. Tag-Bearbeitung
- Tags werden als Chips oder Multi-Select angezeigt
- Tags können inline hinzugefügt/entfernt werden
- **Jede Änderung an den Tags wird sofort gespeichert** (direkter PATCH an das Feature-Objekt, inkl. If-Match Header mit etag)
- Nach dem Speichern zeigt das UI die aktuellen Tags
- Maximal 5 Tags pro Feature
- Tag-Namen dürfen nur Buchstaben (a-z, A-Z) und Zahlen (0-9) enthalten
- Neue Tags können frei eingegeben werden, bestehende werden als Vorschläge angezeigt (Autocomplete)

### 3.3. Bulk Edit
- Mehrere Features per Checkbox auswählbar
- Bulk-Dialog erlaubt:
  - Tags zu allen ausgewählten hinzufügen
  - Tags von allen ausgewählten entfernen
  - Alle Tags ersetzen
  - Fehler bei einzelnen Features werden einzeln im UI ausgegeben (z.B. 2 von 10 fehlgeschlagen)
- Bulk-Speichern wendet Änderungen auf alle ausgewählten Features an (mehrere PATCH-Requests)

### 3.4. Filter/Suche
- Filterleiste zum Suchen nach Name, Reference oder Tags
- Tag-Cloud oder Dropdown zum Filtern nach Tag

### 3.5. Status & Auth
- Statusleiste zeigt Login-Status (Token gültig/ungültig)
- Modal-Dialog für API-Zugangsdaten und Token-Verwaltung

---

## 4. Verhalten

- Beim Laden werden alle Feature-Modelle geladen. Die zugehörigen Nodes und Beziehungen werden erst beim Aufklappen eines Knotens (Lazy Loading) geladen, um die Performance zu verbessern.
- **Tag-Änderungen werden sofort gespeichert, ohne Zwischenspeicherung**
- Nach jedem Speichern zeigt das UI die aktuellen Daten von der API
- API-Fehler werden als Nachricht angezeigt
- Tag-Änderungen werden vor dem Senden validiert (Länge, Duplikate etc.)

---

## 5. Datenfluss

- Die Tree-Struktur wird aus `/FeatureModels`, `/FeatureModelNodes`, `/FeatureModelRelationships` gebaut
- Jeder Knoten im Tree ist mit einem `Feature` (über `featureId`) verknüpft
- Tags werden immer direkt über das Feature-Objekt gelesen und geschrieben
- Die Auswahl (Checkboxen für Bulk-Operationen) wird lokal im UI verwaltet
- Es gibt keine besonderen Performance-Anforderungen für sehr große Bäume, aber Lazy Loading wird verwendet.

---

## 6. Architektur

- **Frontend:**  
  - Framework: Vue 3 (Composition API, SFCs)
  - State-Management: Pinia
  - UI-Komponenten: Naive UI (oder alternativ Vuetify)
  - HTTP-Client: Fetch API (nativ) oder Axios
  - Authentifizierung: OAuth2 Client Credentials Flow (Token-Dialog)
  - Build-Tool: Vite

- **Backend:**  
  - Keine eigene Backend-Logik, reine API-Anbindung an Elfsquad

- **API-Kommunikation:**  
  - Alle Daten werden direkt von der Elfsquad API geladen und gespeichert
  - PATCH-Requests für Tag-Änderungen immer mit aktuellem etag im If-Match Header

---

## 7. Wichtige Bibliotheken

- `vue` (v3.x)
- `pinia` (State-Management)
- `naive-ui` (UI-Komponenten)
- `vite` (Build-Tool)
- `@vueuse/core` (Hilfsfunktionen für Vue)
- Optional: `axios` (für HTTP, falls fetch nicht reicht)

---

Diese Spezifikation bildet die Grundlage für die Entwicklung der App.
