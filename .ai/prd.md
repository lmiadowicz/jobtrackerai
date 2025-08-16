# Dokument wymagań produktu (PRD) - JobTrackAI

## 1. Przegląd produktu

JobTrackAI to aplikacja webowa typu MVP, która rozwiązuje problem czasochłonnego dostosowywania CV do ofert pracy oraz chaotycznego śledzenia statusu aplikacji.  
Aplikacja wykorzystuje sztuczną inteligencję do automatycznego personalizowania CV na podstawie wymagań z oferty pracy, jednocześnie oferując prosty system kanban do zarządzania procesem rekrutacyjnym.

Aplikacja jest skierowana do kandydatów ze wszystkich branż, nie tylko IT, i będzie dostępna bezpłatnie w wersji MVP. System pozwala na nieograniczoną liczbę aplikacji i przechowuje dane użytkownika bezterminowo.

---

## 2. Problem użytkownika

Kandydaci na rynku pracy borykają się z dwoma głównymi problemami:

1. **Dostosowywanie CV do każdej oferty pracy** jest procesem czasochłonnym i żmudnym. Kandydaci często wysyłają generyczne CV, które nie odpowiadają specyficznym wymaganiom pracodawcy, co znacząco zmniejsza ich szanse na zaproszenie na rozmowę.
2. **Śledzenie statusu aplikacji** – przy aplikowaniu na wiele stanowisk jednocześnie, kandydaci tracą kontrolę nad statusem swoich aplikacji. Brak systematycznego śledzenia prowadzi do pomijania terminów, duplikowania aplikacji lub zapominania o follow-upach.

Te problemy skutkują niższą skutecznością procesu poszukiwania pracy, frustracją kandydatów oraz wydłużeniem czasu potrzebnego na znalezienie odpowiedniego stanowiska.

---

## 3. Wymagania funkcjonalne

### 3.1 System uwierzytelniania i kont użytkowników

- Rejestracja nowego użytkownika z walidacją adresu email
- Logowanie i wylogowanie
- Resetowanie hasła
- Sesje użytkownika z bezpiecznym przechowywaniem danych

### 3.2 Profil użytkownika

- Przechowywanie master CV w formie tekstowej
- Lista umiejętności
- Widełki wynagrodzenia (od-do)
- Możliwość edycji wszystkich danych profilu

### 3.3 Generator CV oparty na AI

- Generowanie CV bezpośrednio z karty aplikacji na kanbanie
- Analiza wymagań z oferty przez AI
- Dopasowanie treści CV do wymagań
- Identyfikacja brakujących słów kluczowych
- Generowanie CV w formacie Markdown
- Automatyczne zapisywanie CV w karcie aplikacji
- Ekstrakcja widełek wynagrodzenia z oferty pracy

### 3.4 Generator cover letter

- Automatyczne tworzenie krótkiego listu motywacyjnego
- Dopasowanie treści do oferty i profilu kandydata
- Generowanie w formacie tekstowym

### 3.5 System kanban do śledzenia aplikacji

- Tablica z kolumnami: **Planowane, Wysłane, Odpowiedź, Rozmowa, Oferta, Odrzucenie**
- Dodawanie nowych aplikacji z podstawowymi informacjami (nazwa firmy, stanowisko, link do oferty)
- Ręczne przenoszenie kart między kolumnami
- Edycja i usuwanie kart
- Przechowywanie historii wygenerowanych CV dla każdej aplikacji

---

## 4. Granice produktu

Funkcjonalności **NIE** wchodzące w zakres MVP:

- Import ofert z portali pracy (LinkedIn, Indeed, inne API)
- Automatyczne wysyłanie aplikacji do pracodawców
- System przypomnień o follow-upach
- Zaawansowana analityka skuteczności CV
- Współdzielenie statusu aplikacji z mentorem lub coachem
- Upload i edycja szablonów DOCX
- Limity generowania CV
- Funkcje płatne lub premium
- Aplikacja mobilna
- Integracje z zewnętrznymi kalendarzami
- Eksport danych do innych formatów

---

## 5. Historie użytkownika

### US-001: Rejestracja nowego użytkownika

**ID:** US-001  
**Tytuł:** Rejestracja konta  
**Opis:** Jako nowy użytkownik chcę móc zarejestrować konto przy użyciu adresu email i hasła, aby uzyskać dostęp do funkcjonalności aplikacji

**Kryteria akceptacji:**

- Formularz rejestracji zawiera pola: email, hasło, potwierdzenie hasła
- Email jest walidowany pod kątem poprawności formatu
- Hasło musi mieć minimum 8 znaków
- System wysyła email z potwierdzeniem rejestracji
- Duplikaty adresów email są odrzucane z odpowiednim komunikatem

---

### US-002: Logowanie użytkownika

**ID:** US-002  
**Tytuł:** Logowanie do systemu  
**Opis:** Jako zarejestrowany użytkownik chcę móc zalogować się do aplikacji używając email i hasła

**Kryteria akceptacji:**

- Formularz logowania zawiera pola: email i hasło
- Po poprawnym logowaniu użytkownik jest przekierowany do dashboardu
- Niepoprawne dane logowania wyświetlają komunikat błędu
- Sesja użytkownika jest bezpiecznie przechowywana

---

### US-003: Resetowanie hasła

**ID:** US-003  
**Tytuł:** Odzyskiwanie dostępu do konta  
**Opis:** Jako użytkownik chcę móc zresetować zapomniane hasło poprzez email

**Kryteria akceptacji:**

- Link "Zapomniałem hasła" dostępny na stronie logowania
- Po podaniu emaila system wysyła link resetujący
- Link resetujący jest ważny przez 24 godziny
- Po ustawieniu nowego hasła użytkownik może się zalogować

---

### US-004: Uzupełnianie profilu

**ID:** US-004  
**Tytuł:** Utworzenie master CV  
**Opis:** Jako użytkownik chcę dodać swoje master CV, umiejętności i widełki płacowe do profilu

**Kryteria akceptacji:**

- Pole tekstowe na master CV przyjmuje minimum 100 znaków
- Możliwość dodania listy umiejętności
- Pola na widełki płacowe (od-do) akceptują tylko liczby
- Wszystkie dane są zapisywane i widoczne po ponownym wejściu

---

### US-005: Generowanie spersonalizowanego CV

**ID:** US-005  
**Tytuł:** Dopasowanie CV do oferty  
**Opis:** Jako użytkownik chcę wygenerować CV dopasowane do oferty pracy z poziomu karty aplikacji

**Kryteria akceptacji:**

- Przycisk "Generuj CV" dostępny w karcie aplikacji
- CV generowane na podstawie job description z karty
- Czas generowania nie przekracza 3 minut
- Wygenerowane CV jest zapisywane w formacie Markdown
- CV jest automatycznie przypisane do karty aplikacji
- Widełki wynagrodzenia są ekstrahowane z oferty i zapisane w karcie

---

### US-006: Generowanie cover letter

**ID:** US-006  
**Tytuł:** Tworzenie listu motywacyjnego  
**Opis:** Jako użytkownik chcę otrzymać krótki list motywacyjny dopasowany do oferty

**Kryteria akceptacji:**

- Cover letter generowany jest razem z CV
- Treść listu nie przekracza 250 słów
- List jest dopasowany do oferty i profilu użytkownika
- Możliwość skopiowania treści listu

---

### US-007: Dodawanie aplikacji do kanbana

**ID:** US-007  
**Tytuł:** Utworzenie nowej aplikacji  
**Opis:** Jako użytkownik chcę dodać nową aplikację do systemu śledzenia

**Kryteria akceptacji:**

- Formularz zawiera pola: nazwa firmy, stanowisko, link do oferty, job description
- Nowa aplikacja pojawia się w kolumnie "Planowane"
- Job description jest przechowywane w karcie
- Możliwość późniejszego generowania CV z poziomu karty

---

### US-008: Zarządzanie statusem aplikacji

**ID:** US-008  
**Tytuł:** Aktualizacja statusu aplikacji  
**Opis:** Jako użytkownik chcę przenosić aplikacje między kolumnami kanbana

**Kryteria akceptacji:**

- Aplikacje można przeciągać między kolumnami
- Dostępne kolumny: Planowane, Wysłane, Odpowiedź, Rozmowa, Oferta, Odrzucenie
- Zmiana statusu jest natychmiast zapisywana
- Historia zmian jest przechowywana

---

### US-009: Przeglądanie szczegółów aplikacji

**ID:** US-009  
**Tytuł:** Podgląd aplikacji  
**Opis:** Jako użytkownik chcę zobaczyć szczegóły aplikacji i powiązane dokumenty

**Kryteria akceptacji:**

- Kliknięcie w kartę aplikacji otwiera szczegóły
- Widoczne informacje: firma, stanowisko, link, data utworzenia, widełki wynagrodzenia
- Podgląd job description
- Podgląd wygenerowanego CV w Markdown (jeśli istnieje)
- Możliwość edycji podstawowych informacji

---

### US-010: Usuwanie aplikacji

**ID:** US-010  
**Tytuł:** Usunięcie aplikacji z systemu  
**Opis:** Jako użytkownik chcę móc usunąć niepotrzebne aplikacje

**Kryteria akceptacji:**

- Opcja usunięcia dostępna w szczegółach aplikacji
- Potwierdzenie przed usunięciem
- Usunięcie jest trwałe i nieodwracalne
- Powiązane CV jest usuwane wraz z kartą

---

### US-011: Przeglądanie dashboardu

**ID:** US-011  
**Tytuł:** Widok główny aplikacji  
**Opis:** Jako użytkownik chcę widzieć podsumowanie moich aplikacji na dashboardzie

**Kryteria akceptacji:**

- Dashboard wyświetla kanban z wszystkimi aplikacjami
- Widoczna liczba aplikacji w każdej kolumnie
- Szybki dostęp do dodania nowej aplikacji
- Informacja o ostatnio wygenerowanych CV

---

### US-012: Edycja profilu

**ID:** US-012  
**Tytuł:** Aktualizacja danych profilu  
**Opis:** Jako użytkownik chcę móc edytować swoje master CV i inne dane profilu

**Kryteria akceptacji:**

- Wszystkie pola profilu są edytowalne
- Zmiany są zapisywane po kliknięciu "Zapisz"
- Możliwość anulowania zmian
- Walidacja poprawności danych przed zapisem

---

### US-013: Wylogowanie

**ID:** US-013  
**Tytuł:** Zakończenie sesji  
**Opis:** Jako użytkownik chcę móc bezpiecznie wylogować się z aplikacji

**Kryteria akceptacji:**

- Przycisk wylogowania dostępny w menu użytkownika
- Po wylogowaniu przekierowanie na stronę logowania
- Sesja użytkownika jest prawidłowo zakończona
- Próba dostępu do chronionych stron przekierowuje do logowania

---

### US-014: Kopiowanie CV z karty

**ID:** US-014  
**Tytuł:** Eksport CV w formacie tekstowym  
**Opis:** Jako użytkownik chcę móc skopiować wygenerowane CV z karty aplikacji

**Kryteria akceptacji:**

- Przycisk "Kopiuj CV" w szczegółach aplikacji
- CV kopiowane jest w formacie Markdown
- Potwierdzenie skopiowania do schowka
- CV dostępne tylko jeśli zostało wcześniej wygenerowane

---

## 6. Metryki sukcesu

### 6.1 Metryki użytkowania

- 70% użytkowników śledzi minimum 5 aplikacji jednocześnie w systemie kanban
- Średni czas utworzenia dopasowanego CV wynosi poniżej 3 minut
- 80% wygenerowanych CV otrzymuje pozytywną ocenę (kciuk w górę)

### 6.2 Metryki zaangażowania

- Wskaźnik retencji użytkowników po 30 dniach wynosi minimum 40%
- Średnia liczba wygenerowanych CV na użytkownika miesięcznie: minimum 8
- Odsetek użytkowników z uzupełnionym profilem (master CV + umiejętności): powyżej 85%

### 6.3 Metryki techniczne

- Dostępność aplikacji: 99.5% w skali miesiąca
- Czas odpowiedzi API generowania CV: poniżej 3 minut w 95% przypadków
- Czas ładowania dashboardu: poniżej 2 sekund

### 6.4 Sposoby pomiaru

- Implementacja systemu analityki (Google Analytics lub podobny)
- Wbudowany system zbierania feedbacku (kciuk góra/dół)
- Monitoring wydajności aplikacji
- Regularne ankiety użytkowników (opcjonalne)
