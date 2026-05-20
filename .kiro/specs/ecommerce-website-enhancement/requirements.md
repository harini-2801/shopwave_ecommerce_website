# Requirements Document

## Introduction

ShopWave is an existing single-page ecommerce storefront built with HTML, CSS, and vanilla JavaScript. The site currently has a fully structured HTML layout (announcement bar, sticky header, hero slider, flash sale, category showcase, products grid, promo banners, brands section, newsletter, footer, cart sidebar, toast notifications, back-to-top button) and a polished CSS stylesheet — but zero JavaScript functionality. All interactive functions referenced in the HTML (`doSearch`, `filterCat`, `slideHero`, `goSlide`, `sortProducts`, `setView`, `loadMore`, `subscribeNL`, `openCart`, `closeCart`) are unimplemented stubs.

This enhancement delivers:
1. **`products.js`** — a rich product data catalogue with 50+ products across all 9 categories.
2. **`app.js`** — complete application logic wiring every interactive element in the existing HTML.
3. **CSS upgrades** to `ecomm.css` — glassmorphism effects, micro-animations, skeleton loaders, quick-view overlays, animated badges, and gradient accents that elevate the UI to a premium, eye-catching experience.
4. **Structural improvements** — subcategory hierarchy, price-range filtering, brand filtering, and a filter sidebar that integrates cleanly with the existing layout.

---

## Glossary

- **App**: The `app.js` JavaScript module that owns all runtime application logic.
- **Catalogue**: The `products.js` file that exports the `PRODUCTS` array and `CATEGORIES` map.
- **Cart**: The slide-in sidebar (`#cartSidebar`) that holds items the user intends to purchase.
- **Category_Nav**: The horizontal `<nav class="cat-nav">` bar beneath the header.
- **Countdown_Timer**: The `#countdown` element inside the Flash Sale section that counts down to zero.
- **Filter_Sidebar**: A new collapsible panel rendered to the left of the main products grid, containing price-range, brand, and subcategory filters.
- **Flash_Grid**: The `#flashGrid` products grid inside the Flash Sale section.
- **Hero_Slider**: The `#heroSlider` element containing three `.hero-slide` panels.
- **Load_More**: The `#loadMoreBtn` button that appends additional product cards to the Main_Grid.
- **Main_Grid**: The `#mainGrid` products grid in the Products Section.
- **Product_Card**: A rendered HTML card representing one product entry from the Catalogue.
- **Quick_View**: A modal overlay that displays expanded product details without navigating away.
- **Skeleton_Loader**: A placeholder card with animated shimmer shown while products are being rendered.
- **Toast**: The `#toast` element used for transient user feedback messages.
- **Wishlist**: A client-side list of products the user has saved for later, persisted in `localStorage`.
- **Cart_State**: The in-memory object tracking cart items, quantities, and totals, persisted in `localStorage`.

---

## Requirements

### Requirement 1: Product Catalogue Data File

**User Story:** As a developer, I want a structured product data file, so that the App has a rich, realistic dataset to render across all site sections.

#### Acceptance Criteria

1. THE Catalogue SHALL export a `PRODUCTS` array containing a minimum of 54 product objects (6 per category × 9 categories).
2. THE Catalogue SHALL export a `CATEGORIES` map that defines each of the 9 top-level categories (`electronics`, `fashion`, `home`, `beauty`, `sports`, `books`, `toys`, `grocery`, `automotive`) with a label, emoji, and an array of at least 3 subcategory strings.
3. WHEN a product object is defined, THE Catalogue SHALL include the following fields: `id` (unique string), `name`, `brand`, `category`, `subcategory`, `price` (number, INR), `originalPrice` (number ≥ `price`), `discount` (integer percentage), `rating` (number 1.0–5.0), `reviewCount` (integer), `emoji` (single emoji string used as the visual placeholder), `badges` (array of zero or more strings from the set `["sale","new","hot","limited"]`), `delivery` (string), `isNew` (boolean), and `isFeatured` (boolean).
4. THE Catalogue SHALL include at least 8 products where `badges` contains `"sale"`, at least 6 products where `badges` contains `"new"`, and at least 4 products where `badges` contains `"hot"`.
5. THE Catalogue SHALL include products from at least 10 distinct brand names that match the brands listed in the HTML brands row (Apple, Samsung, Nike, Adidas, Sony, IKEA, L'Oréal, Levi's, Dell, boAt, Puma, Philips).
6. IF a product's `originalPrice` equals its `price`, THEN THE Catalogue SHALL set `discount` to `0` for that product.

---

### Requirement 2: Hero Slider Auto-Play

**User Story:** As a visitor, I want the hero banner to cycle through slides automatically, so that I see all featured promotions without manual interaction.

#### Acceptance Criteria

1. WHEN the page loads, THE Hero_Slider SHALL begin auto-advancing slides at an interval of 5000 milliseconds.
2. WHEN the user clicks the previous or next arrow button, THE Hero_Slider SHALL navigate to the adjacent slide and reset the auto-play interval.
3. WHEN the user clicks a dot indicator, THE Hero_Slider SHALL jump to the corresponding slide and reset the auto-play interval.
4. WHEN the active slide changes, THE Hero_Slider SHALL update the `active` class on both the `.hero-slide` elements and the `.dot` elements to reflect the current slide index.
5. WHEN the last slide is active and the slider advances, THE Hero_Slider SHALL wrap around to the first slide.
6. WHEN the first slide is active and the user navigates backward, THE Hero_Slider SHALL wrap around to the last slide.

---

### Requirement 3: Flash Sale Countdown Timer

**User Story:** As a visitor, I want to see a live countdown timer on the Flash Sale section, so that I feel urgency to act on the deals.

#### Acceptance Criteria

1. WHEN the page loads, THE Countdown_Timer SHALL initialise to a target time 6 hours from the current time.
2. WHILE the target time has not been reached, THE Countdown_Timer SHALL update the `#hours`, `#mins`, and `#secs` display elements every 1000 milliseconds.
3. WHEN the countdown reaches zero, THE Countdown_Timer SHALL reset to a new target time 6 hours from the moment of reset.
4. THE Countdown_Timer SHALL display hours, minutes, and seconds each zero-padded to two digits (e.g., `"05"`, `"09"`, `"00"`).

---

### Requirement 4: Product Rendering

**User Story:** As a visitor, I want to see product cards rendered on the page, so that I can browse and discover items to purchase.

#### Acceptance Criteria

1. WHEN the page loads, THE App SHALL render Skeleton_Loaders in the Main_Grid for 400 milliseconds before replacing them with Product_Cards.
2. WHEN the page loads, THE App SHALL render the first 12 products from the Catalogue into the Main_Grid.
3. WHEN the page loads, THE App SHALL render the 8 products with the highest `discount` value into the Flash_Grid.
4. WHEN a Product_Card is rendered, THE App SHALL display the product's emoji, brand, name, star rating, review count, current price (formatted as `₹X,XXX`), original price with strikethrough, discount percentage badge, delivery string, and action buttons (Add to Cart, Buy Now).
5. WHEN a Product_Card is rendered and the product's `badges` array is non-empty, THE App SHALL display each badge tag with the correct colour class (`sale` → red, `new` → green, `hot` → orange, `limited` → purple).
6. WHEN a Product_Card is rendered, THE App SHALL display a wishlist heart button that reflects the current Wishlist state for that product.
7. THE App SHALL update the `#productCount` span to display the total number of products currently shown in the Main_Grid.

---

### Requirement 5: Category Filtering

**User Story:** As a visitor, I want to filter products by category, so that I can quickly find items relevant to my interests.

#### Acceptance Criteria

1. WHEN the user clicks a category link in the Category_Nav, THE App SHALL filter the Main_Grid to show only products matching the selected category.
2. WHEN the user clicks a category card in the category showcase grid, THE App SHALL filter the Main_Grid to show only products matching the selected category and scroll the viewport to the Products Section.
3. WHEN a category filter is applied, THE App SHALL update the `active` class on the Category_Nav links to highlight the selected category.
4. WHEN a category filter is applied, THE App SHALL update the `#sectionTitle` heading to display the selected category's label (e.g., "Electronics").
5. WHEN the user selects "All" from the Category_Nav, THE App SHALL display all products in the Main_Grid.
6. WHEN a category filter is applied, THE App SHALL reset the visible product count to 12 and hide the Load_More button if fewer than 12 products exist in that category.

---

### Requirement 6: Search Functionality

**User Story:** As a visitor, I want to search for products by name or brand, so that I can find specific items quickly.

#### Acceptance Criteria

1. WHEN the user clicks the search button or presses the Enter key in the search input, THE App SHALL filter the Main_Grid to show only products whose `name` or `brand` contains the search query (case-insensitive).
2. WHEN a category is selected in the `#searchCat` dropdown and a search is performed, THE App SHALL restrict results to products in that category that also match the search query.
3. WHEN a search returns zero results, THE App SHALL display an empty-state message in the Main_Grid reading "No products found for '[query]'".
4. WHEN the search input is cleared and the search is re-submitted, THE App SHALL restore the full product list for the currently active category.
5. WHEN a search is performed, THE App SHALL update the `#sectionTitle` heading to display "Search results for '[query]'".

---

### Requirement 7: Sort and Filter Controls

**User Story:** As a visitor, I want to sort and filter the product list, so that I can find the best match for my needs.

#### Acceptance Criteria

1. WHEN the user clicks the "Price: Low to High" chip, THE App SHALL re-render the Main_Grid with products sorted by ascending `price`.
2. WHEN the user clicks the "Price: High to Low" chip, THE App SHALL re-render the Main_Grid with products sorted by descending `price`.
3. WHEN the user clicks the "Top Rated" chip, THE App SHALL re-render the Main_Grid with products sorted by descending `rating`.
4. WHEN the user clicks the "Newest" chip, THE App SHALL re-render the Main_Grid with products sorted by `isNew` products first, then by `id`.
5. WHEN the user clicks the "Featured" chip, THE App SHALL re-render the Main_Grid with `isFeatured` products first, preserving original Catalogue order for the remainder.
6. WHEN a sort chip is clicked, THE App SHALL update the `active` class to the clicked chip and remove it from all other chips.

---

### Requirement 8: Filter Sidebar

**User Story:** As a visitor, I want to filter products by price range, brand, and subcategory, so that I can narrow down results precisely.

#### Acceptance Criteria

1. THE App SHALL render a Filter_Sidebar to the left of the Main_Grid containing three collapsible sections: "Price Range", "Brands", and "Subcategories".
2. WHEN the user adjusts the price range inputs (min and max), THE App SHALL filter the Main_Grid to show only products whose `price` falls within the specified range.
3. WHEN the user selects one or more brand checkboxes in the Filter_Sidebar, THE App SHALL filter the Main_Grid to show only products whose `brand` matches one of the selected brands.
4. WHEN the user selects one or more subcategory checkboxes in the Filter_Sidebar, THE App SHALL filter the Main_Grid to show only products whose `subcategory` matches one of the selected subcategories.
5. WHEN multiple filter types are active simultaneously, THE App SHALL apply all active filters as a conjunction (AND logic).
6. WHEN a category filter changes via the Category_Nav, THE App SHALL update the Subcategories section of the Filter_Sidebar to show only subcategories belonging to the newly selected category.
7. THE App SHALL display a "Clear Filters" button in the Filter_Sidebar that, WHEN clicked, resets all filter inputs and restores the full product list for the active category.

---

### Requirement 9: Grid and List View Toggle

**User Story:** As a visitor, I want to switch between grid and list views, so that I can browse products in the layout I prefer.

#### Acceptance Criteria

1. WHEN the user clicks the grid view button (`#gridView`), THE App SHALL apply the default multi-column grid layout to the Main_Grid.
2. WHEN the user clicks the list view button (`#listView`), THE App SHALL apply the `.list-mode` class to the Main_Grid, rendering Product_Cards in a single-column horizontal layout.
3. WHEN the view is toggled, THE App SHALL update the `active` class on the view toggle buttons to reflect the current view.
4. WHEN the list view is active, THE App SHALL render each Product_Card with the product image on the left and product details on the right, as defined by the existing `.list-mode` CSS rules.

---

### Requirement 10: Load More Products

**User Story:** As a visitor, I want to load additional products incrementally, so that the initial page load is fast and I can explore more items on demand.

#### Acceptance Criteria

1. WHEN the user clicks the Load_More button, THE App SHALL append the next 8 products from the currently filtered and sorted product list to the Main_Grid.
2. WHEN all products in the current filtered list have been rendered, THE App SHALL hide the Load_More button.
3. WHEN a new category filter or search is applied, THE App SHALL reset the rendered product count to 12 and show the Load_More button if more than 12 products exist in the filtered list.

---

### Requirement 11: Cart Management

**User Story:** As a visitor, I want to add products to a cart and manage quantities, so that I can collect items before purchasing.

#### Acceptance Criteria

1. WHEN the user clicks "Add to Cart" on a Product_Card, THE App SHALL add the product to the Cart_State with a quantity of 1, or increment its quantity by 1 if it already exists.
2. WHEN the user clicks "Add to Cart", THE App SHALL display a Toast notification reading "Added to cart: [product name]" for 2500 milliseconds.
3. WHEN the Cart_State changes, THE App SHALL update the `#cartBadge` to display the total number of distinct items in the cart.
4. WHEN the user opens the cart sidebar, THE App SHALL render all Cart_State items as cart item rows showing the product emoji, brand, name, unit price, and a quantity control.
5. WHEN the user clicks the quantity increment button on a cart item, THE App SHALL increase that item's quantity by 1 and update the cart subtotal and total.
6. WHEN the user clicks the quantity decrement button on a cart item and the quantity is greater than 1, THE App SHALL decrease that item's quantity by 1 and update the cart subtotal and total.
7. WHEN the user clicks the quantity decrement button on a cart item and the quantity equals 1, THE App SHALL remove that item from the Cart_State.
8. WHEN the user clicks the remove button on a cart item, THE App SHALL remove that item from the Cart_State regardless of quantity.
9. WHEN the Cart_State is empty, THE App SHALL show the `#cartEmpty` element and hide the `#cartFooter`.
10. WHEN the Cart_State contains at least one item, THE App SHALL hide the `#cartEmpty` element and show the `#cartFooter` with the correct subtotal and total.
11. WHEN the Cart_State changes, THE App SHALL persist the updated Cart_State to `localStorage` under the key `"shopwave_cart"`.
12. WHEN the page loads, THE App SHALL restore the Cart_State from `localStorage` if a saved state exists.

---

### Requirement 12: Wishlist Management

**User Story:** As a visitor, I want to save products to a wishlist, so that I can revisit items I am interested in later.

#### Acceptance Criteria

1. WHEN the user clicks the wishlist heart button on a Product_Card, THE App SHALL toggle the product's presence in the Wishlist.
2. WHEN a product is added to the Wishlist, THE App SHALL add the `wishlisted` class to that product's heart button and display a Toast reading "Added to wishlist: [product name]".
3. WHEN a product is removed from the Wishlist, THE App SHALL remove the `wishlisted` class from that product's heart button and display a Toast reading "Removed from wishlist".
4. WHEN the Wishlist changes, THE App SHALL update the `#wishBadge` to display the total number of items in the Wishlist.
5. WHEN the Wishlist changes, THE App SHALL persist the updated Wishlist to `localStorage` under the key `"shopwave_wishlist"`.
6. WHEN the page loads, THE App SHALL restore the Wishlist from `localStorage` and apply the `wishlisted` class to all matching Product_Card heart buttons.

---

### Requirement 13: Cart Sidebar Open/Close

**User Story:** As a visitor, I want to open and close the cart sidebar smoothly, so that I can review my cart without leaving the page.

#### Acceptance Criteria

1. WHEN the user clicks the cart icon (`#cartToggle`), THE App SHALL add the `open` class to both `#cartSidebar` and `#cartOverlay`.
2. WHEN the user clicks the close button (`#cartClose`) or the overlay (`#cartOverlay`), THE App SHALL remove the `open` class from both `#cartSidebar` and `#cartOverlay`.
3. WHILE the cart sidebar is open, THE App SHALL prevent the document body from scrolling.
4. WHEN the cart sidebar opens, THE App SHALL re-render the cart item list to reflect the current Cart_State.

---

### Requirement 14: Newsletter Subscription

**User Story:** As a visitor, I want to subscribe to the newsletter, so that I receive exclusive deals and updates.

#### Acceptance Criteria

1. WHEN the user clicks the Subscribe button with a valid email address in `#nlEmail`, THE App SHALL display a Toast notification reading "Subscribed! Welcome to ShopWave." and clear the input field.
2. WHEN the user clicks the Subscribe button with an empty or invalid email address, THE App SHALL display a Toast notification reading "Please enter a valid email address." and not clear the input field.
3. THE App SHALL validate the email address using a standard email format check (contains `@` and a domain with at least one `.`).

---

### Requirement 15: Toast Notification System

**User Story:** As a visitor, I want brief feedback messages after actions, so that I know my interactions have been registered.

#### Acceptance Criteria

1. WHEN the App calls the toast function with a message string, THE App SHALL add the `show` class to `#toast`, set its text content to the message, and remove the `show` class after 2500 milliseconds.
2. WHEN a new toast is triggered while a previous toast is still visible, THE App SHALL reset the 2500-millisecond timer and update the message to the new string.
3. THE App SHALL support an optional type parameter (`"success"`, `"error"`, `"info"`) that applies a corresponding background colour to the toast (success → `--green`, error → `--red`, info → `--navy`).

---

### Requirement 16: Back-to-Top Button

**User Story:** As a visitor, I want a back-to-top button to appear when I scroll down, so that I can return to the top of the page quickly.

#### Acceptance Criteria

1. WHEN the user scrolls more than 400 pixels from the top of the page, THE App SHALL add the `visible` class to `#backToTop`.
2. WHEN the user scrolls to within 400 pixels of the top of the page, THE App SHALL remove the `visible` class from `#backToTop`.
3. WHEN the user clicks `#backToTop`, THE App SHALL scroll the window to the top with smooth behaviour.

---

### Requirement 17: Scroll-Based Header Effects

**User Story:** As a visitor, I want the header to visually respond to scrolling, so that the interface feels polished and the header remains readable over page content.

#### Acceptance Criteria

1. WHEN the user scrolls more than 10 pixels from the top of the page, THE App SHALL add a `scrolled` CSS class to `#header`.
2. WHEN the `scrolled` class is present on `#header`, THE CSS SHALL apply an increased `box-shadow` and a slightly reduced header height to indicate the scrolled state.
3. WHEN the user scrolls back to within 10 pixels of the top, THE App SHALL remove the `scrolled` class from `#header`.

---

### Requirement 18: Glassmorphism and Premium UI Enhancements

**User Story:** As a visitor, I want the website to have a visually striking, premium appearance, so that browsing feels enjoyable and the brand feels trustworthy.

#### Acceptance Criteria

1. THE CSS SHALL apply a glassmorphism style (semi-transparent background with `backdrop-filter: blur`) to the hero slider navigation arrows and dot indicators.
2. THE CSS SHALL add a quick-view overlay to each Product_Card that appears on hover, containing a "Quick View" button centred over the product image area.
3. THE CSS SHALL define `.skeleton` and `.skeleton-shimmer` classes that render an animated shimmer placeholder matching the dimensions of a Product_Card.
4. THE CSS SHALL add animated badge styles: `"new"` badges SHALL pulse with a subtle scale animation; `"hot"` badges SHALL glow with an orange box-shadow animation.
5. THE CSS SHALL apply gradient accent underlines to section headings using a CSS `::after` pseudo-element with a linear gradient from `--orange` to `--teal`.
6. THE CSS SHALL add smooth micro-animation transitions (scale and shadow) to Product_Cards, category cards, and brand chips on hover, with a duration of 200–300 milliseconds.
7. THE CSS SHALL define a `.header.scrolled` rule that increases the header's `box-shadow` intensity and reduces the header padding to create a compact scrolled state.
8. WHERE the user's device supports `prefers-reduced-motion: reduce`, THE CSS SHALL disable all non-essential animations and transitions.

---

### Requirement 19: Responsive Layout Integrity

**User Story:** As a visitor on any device, I want the website to display correctly and remain fully usable, so that I can shop from a phone, tablet, or desktop.

#### Acceptance Criteria

1. WHILE the viewport width is 480 pixels or less, THE CSS SHALL render the Main_Grid as a 2-column layout and collapse the Filter_Sidebar into a toggleable drawer.
2. WHILE the viewport width is between 481 pixels and 768 pixels, THE CSS SHALL render the Main_Grid as a 3-column layout and hide the Filter_Sidebar by default with a "Filters" toggle button.
3. WHILE the viewport width is 769 pixels or greater, THE CSS SHALL render the Filter_Sidebar as a persistent left panel alongside the Main_Grid.
4. WHILE the viewport width is 900 pixels or less, THE CSS SHALL hide the hero visual illustration and expand the hero text content to full width.
5. THE CSS SHALL ensure all interactive elements (buttons, links, form inputs) have a minimum touch target size of 44×44 pixels on mobile viewports.

---

### Requirement 20: Data Integrity and Round-Trip Consistency

**User Story:** As a developer, I want the Cart_State and Wishlist to survive page reloads without data loss, so that users do not lose their selections.

#### Acceptance Criteria

1. FOR ALL Cart_State objects saved to `localStorage`, THE App SHALL produce an equivalent Cart_State when the saved value is parsed and restored on page load (round-trip property).
2. FOR ALL Wishlist arrays saved to `localStorage`, THE App SHALL produce an equivalent Wishlist when the saved value is parsed and restored on page load (round-trip property).
3. IF the value stored in `localStorage` under `"shopwave_cart"` is malformed or unparseable, THEN THE App SHALL initialise the Cart_State to an empty object and log a warning to the console.
4. IF the value stored in `localStorage` under `"shopwave_wishlist"` is malformed or unparseable, THEN THE App SHALL initialise the Wishlist to an empty array and log a warning to the console.
