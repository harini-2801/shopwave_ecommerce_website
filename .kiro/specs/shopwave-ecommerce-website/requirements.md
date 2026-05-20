# Requirements Document

## Introduction

ShopWave is a fully functional, single-page ecommerce website built with HTML, CSS, and vanilla JavaScript. The existing `ecomm.html` and `ecomm.css` files provide a complete, posh UI shell — including an announcement bar, sticky header with search, category navigation, hero banner slider, flash sale section, category showcase, all-products grid, promo banners, top brands, newsletter, footer, cart sidebar, and toast notifications. Two JavaScript files must be created to bring the site to life:

- **`products.js`** — a structured product data catalogue covering all 10 categories
- **`app.js`** — the application logic that powers every interactive feature referenced in the HTML

The goal is a seamless, visually impressive shopping experience that works entirely in the browser without any backend, using `localStorage` for cart and wishlist persistence.

---

## Glossary

- **App**: The `app.js` JavaScript module that contains all application logic.
- **Catalogue**: The full set of product objects defined in `products.js`.
- **Cart**: The in-memory and `localStorage`-persisted collection of items the user intends to purchase.
- **Wishlist**: The in-memory and `localStorage`-persisted collection of products the user has saved for later.
- **Flash_Sale_Products**: The subset of products flagged `flashSale: true` in the Catalogue.
- **Hero_Slider**: The three-slide banner carousel in `#heroSlider`.
- **Category_Nav**: The sticky navigation bar with `data-cat` links.
- **Main_Grid**: The `#mainGrid` element that renders the paginated, sortable, filterable product list.
- **Flash_Grid**: The `#flashGrid` element that renders Flash_Sale_Products.
- **Cat_Grid**: The `#catGrid` element that renders the "Shop by Category" cards.
- **Countdown_Timer**: The live countdown displayed in `#countdown` for the Flash Sale.
- **Toast**: The `#toast` element used for transient user feedback messages.
- **Product_Card**: A rendered HTML card representing a single product in a grid or list.
- **Sort_Chip**: One of the filter buttons (`featured`, `low`, `high`, `rating`, `new`) in `#filterChips`.
- **Page_Size**: The number of products loaded per batch in Main_Grid (default: 12).
- **View_Mode**: Either `grid` (default) or `list`, toggled by the view buttons.
- **Badge**: The numeric counter overlay on the wishlist and cart action buttons.

---

## Requirements

### Requirement 1: Product Data Catalogue

**User Story:** As a developer, I want a structured product data file, so that the App has rich, realistic product data to render across all sections of the site.

#### Acceptance Criteria

1. THE Catalogue SHALL be defined in `products.js` as a globally accessible array named `PRODUCTS`.
2. THE Catalogue SHALL contain a minimum of 60 product objects distributed across all 10 categories: `electronics`, `fashion`, `home`, `beauty`, `sports`, `books`, `toys`, `grocery`, `automotive`, and at least 6 products per category.
3. EACH product object in the Catalogue SHALL contain the following fields: `id` (unique integer), `name` (string), `brand` (string), `category` (string matching a valid category slug), `price` (number, current price in INR), `originalPrice` (number, original price ≥ `price`), `rating` (number between 1.0 and 5.0), `reviews` (integer ≥ 0), `emoji` (string, a single emoji representing the product), `badge` (string: `"sale"`, `"new"`, `"hot"`, `"limited"`, or `null`), `flashSale` (boolean), `featured` (boolean), `delivery` (string, e.g. `"Free delivery"`), `dateAdded` (ISO 8601 date string), and `tags` (array of strings).
4. THE Catalogue SHALL include at least 8 products with `flashSale: true` spread across at least 3 different categories.
5. THE Catalogue SHALL include at least 12 products with `featured: true`.
6. FOR ALL products in the Catalogue, the computed discount percentage `Math.round((1 - price / originalPrice) * 100)` SHALL be a non-negative integer between 0 and 90 inclusive.

---

### Requirement 2: Application Initialisation

**User Story:** As a user, I want the page to load with all sections populated and my previous cart and wishlist restored, so that I can continue shopping seamlessly from where I left off.

#### Acceptance Criteria

1. WHEN the DOM content is fully loaded, THE App SHALL render Flash_Sale_Products into Flash_Grid, render category cards into Cat_Grid, and render the first Page_Size products into Main_Grid.
2. WHEN the DOM content is fully loaded, THE App SHALL restore the Cart from `localStorage` key `shopwave_cart` and restore the Wishlist from `localStorage` key `shopwave_wishlist`.
3. WHEN the DOM content is fully loaded, THE App SHALL update the cart Badge (`#cartBadge`) and wishlist Badge (`#wishBadge`) to reflect the restored counts.
4. WHEN the DOM content is fully loaded, THE App SHALL start the Countdown_Timer and the Hero_Slider auto-advance interval.
5. IF `localStorage` does not contain a valid JSON array for `shopwave_cart` or `shopwave_wishlist`, THEN THE App SHALL initialise those collections as empty arrays without throwing an error.

---

### Requirement 3: Hero Banner Slider

**User Story:** As a user, I want an animated hero banner that cycles through promotional slides, so that I am immediately engaged with featured deals.

#### Acceptance Criteria

1. WHEN the page loads, THE Hero_Slider SHALL display the first slide as active and auto-advance to the next slide every 5 seconds.
2. WHEN `slideHero(dir)` is called with `dir = 1`, THE Hero_Slider SHALL transition to the next slide; WHEN called with `dir = -1`, THE Hero_Slider SHALL transition to the previous slide.
3. WHEN `goSlide(index)` is called with a valid zero-based index, THE Hero_Slider SHALL display the slide at that index.
4. WHEN a slide transition occurs, THE App SHALL update the active dot in `#slideDots` to match the current slide index.
5. WHEN `slideHero` or `goSlide` is called, THE App SHALL reset the auto-advance timer so the next auto-advance occurs 5 seconds after the manual interaction.
6. IF `slideHero` is called when the current slide is the last slide and `dir = 1`, THEN THE Hero_Slider SHALL wrap around to the first slide.
7. IF `slideHero` is called when the current slide is the first slide and `dir = -1`, THEN THE Hero_Slider SHALL wrap around to the last slide.

---

### Requirement 4: Flash Sale Countdown Timer

**User Story:** As a user, I want to see a live countdown timer for the flash sale, so that I feel urgency to take advantage of limited-time deals.

#### Acceptance Criteria

1. WHEN the page loads, THE Countdown_Timer SHALL initialise to a target time 6 hours from the current time and begin counting down in real time.
2. WHILE the Countdown_Timer is running, THE App SHALL update `#hours`, `#mins`, and `#secs` every second with zero-padded two-digit values.
3. IF the Countdown_Timer reaches zero, THEN THE App SHALL reset it to a new 6-hour countdown and continue running.

---

### Requirement 5: Product Card Rendering

**User Story:** As a user, I want visually rich product cards with all relevant information, so that I can quickly evaluate and act on products.

#### Acceptance Criteria

1. WHEN a product is rendered as a Product_Card, THE App SHALL display the product's emoji, brand, name, star rating (filled stars proportional to `rating`), review count, current price (formatted as `₹X,XXX`), original price with strikethrough, discount percentage badge, delivery label, and an "Add to Cart" button.
2. WHEN a product has a non-null `badge` value, THE App SHALL render a badge tag (`sale`, `new`, `hot`, or `limited`) on the Product_Card image area.
3. WHEN a product is in the Wishlist, THE App SHALL render the wishlist heart icon on its Product_Card in a filled/active state.
4. THE App SHALL format all prices using the Indian numbering system (e.g., `₹1,09,999` for 109999).
5. WHEN a Product_Card is rendered in list View_Mode, THE App SHALL display the card in a horizontal layout with the image on the left and details on the right.

---

### Requirement 6: Category Filtering

**User Story:** As a user, I want to filter products by category from both the navigation bar and the category cards, so that I can quickly find products relevant to my interests.

#### Acceptance Criteria

1. WHEN `filterCat(cat)` is called with a valid category slug, THE App SHALL filter the Catalogue to products matching that category, reset pagination to page 1, and re-render Main_Grid with the first Page_Size matching products.
2. WHEN `filterCat('all')` is called, THE App SHALL clear the category filter and display all products.
3. WHEN `filterCat(cat)` is called, THE App SHALL update the `#sectionTitle` text to the category display name and update `#productCount` to reflect the number of matching products.
4. WHEN `filterCat(cat)` is called, THE App SHALL set the matching Category_Nav link to the `active` CSS class and remove `active` from all other links.
5. WHEN `filterCat(cat)` is called, THE App SHALL scroll the viewport smoothly to `#productsSection`.
6. IF `filterCat` is called with a category slug that does not exist in the Catalogue, THEN THE App SHALL display an empty Main_Grid and set `#productCount` to "0 products".

---

### Requirement 7: Product Search

**User Story:** As a user, I want to search for products by keyword and optionally filter by category, so that I can find specific items quickly.

#### Acceptance Criteria

1. WHEN `doSearch()` is called, THE App SHALL read the trimmed value from `#searchInput` and the selected value from `#searchCat`.
2. WHEN `doSearch()` is called with a non-empty keyword, THE App SHALL filter the Catalogue to products whose `name`, `brand`, or `tags` contain the keyword (case-insensitive) and re-render Main_Grid with the results.
3. WHEN `doSearch()` is called with a category selected (not "All"), THE App SHALL additionally restrict results to products in that category.
4. WHEN `doSearch()` is called, THE App SHALL update `#sectionTitle` to `Search: "<keyword>"` and update `#productCount` to reflect the result count.
5. WHEN `doSearch()` is called, THE App SHALL scroll the viewport smoothly to `#productsSection`.
6. IF `doSearch()` is called with an empty keyword and category "All", THEN THE App SHALL reset to showing all products.
7. WHEN the user presses the Enter key while focused on `#searchInput`, THE App SHALL call `doSearch()`.

---

### Requirement 8: Product Sorting

**User Story:** As a user, I want to sort the product list by different criteria, so that I can find the best match for my needs.

#### Acceptance Criteria

1. WHEN `sortProducts('featured')` is called, THE App SHALL sort the current filtered product set so that products with `featured: true` appear first, then by `id` ascending.
2. WHEN `sortProducts('low')` is called, THE App SHALL sort the current filtered product set by `price` ascending.
3. WHEN `sortProducts('high')` is called, THE App SHALL sort the current filtered product set by `price` descending.
4. WHEN `sortProducts('rating')` is called, THE App SHALL sort the current filtered product set by `rating` descending, with ties broken by `reviews` descending.
5. WHEN `sortProducts('new')` is called, THE App SHALL sort the current filtered product set by `dateAdded` descending.
6. WHEN `sortProducts(type)` is called, THE App SHALL set the matching Sort_Chip to the `active` CSS class and remove `active` from all other Sort_Chips.
7. WHEN `sortProducts(type)` is called, THE App SHALL reset pagination to page 1 and re-render Main_Grid.

---

### Requirement 9: Pagination (Load More)

**User Story:** As a user, I want to load more products progressively, so that the page remains fast and I can browse at my own pace.

#### Acceptance Criteria

1. WHEN Main_Grid is first rendered or re-rendered after a filter or sort, THE App SHALL display the first Page_Size (12) products and show the `#loadMoreBtn`.
2. WHEN `loadMore()` is called, THE App SHALL append the next Page_Size products to Main_Grid without removing existing cards.
3. WHEN all products in the current filtered set have been rendered, THE App SHALL hide `#loadMoreBtn`.
4. WHEN `loadMore()` is called and there are fewer than Page_Size remaining products, THE App SHALL render only the remaining products and then hide `#loadMoreBtn`.

---

### Requirement 10: Grid and List View Toggle

**User Story:** As a user, I want to switch between grid and list views for the product listing, so that I can browse in the layout I prefer.

#### Acceptance Criteria

1. WHEN `setView('grid')` is called, THE App SHALL add the CSS class `grid-mode` to Main_Grid, remove `list-mode`, and set the grid view button to `active`.
2. WHEN `setView('list')` is called, THE App SHALL add the CSS class `list-mode` to Main_Grid, remove `grid-mode`, and set the list view button to `active`.
3. WHEN `setView(mode)` is called, THE App SHALL re-render all currently visible Product_Cards in the new layout without resetting pagination.

---

### Requirement 11: Cart Management

**User Story:** As a user, I want to add, remove, and update items in my cart and see a live total, so that I can manage my purchase before checkout.

#### Acceptance Criteria

1. WHEN `addToCart(id)` is called with a valid product `id`, THE App SHALL add the product to the Cart with quantity 1, or increment its quantity by 1 if it is already in the Cart.
2. WHEN `addToCart(id)` is called, THE App SHALL update the cart Badge to reflect the total number of items (sum of all quantities) in the Cart.
3. WHEN `addToCart(id)` is called, THE App SHALL persist the updated Cart to `localStorage` key `shopwave_cart`.
4. WHEN `addToCart(id)` is called, THE App SHALL display a Toast notification: `"<product name> added to cart"`.
5. WHEN `removeFromCart(id)` is called, THE App SHALL remove the item with that `id` from the Cart, re-render the cart sidebar, and persist the updated Cart to `localStorage`.
6. WHEN `updateQty(id, delta)` is called with `delta = 1`, THE App SHALL increment the quantity of the item with that `id` by 1.
7. WHEN `updateQty(id, delta)` is called with `delta = -1` and the item's current quantity is greater than 1, THE App SHALL decrement the quantity by 1.
8. WHEN `updateQty(id, delta)` is called with `delta = -1` and the item's current quantity is exactly 1, THE App SHALL remove the item from the Cart.
9. WHEN the Cart is modified, THE App SHALL recalculate and update `#cartSubtotal` and `#cartTotal` using the sum of `price × quantity` for all Cart items, formatted in the Indian numbering system.
10. WHEN the Cart contains at least one item, THE App SHALL show `#cartFooter` and hide `#cartEmpty`; WHEN the Cart is empty, THE App SHALL hide `#cartFooter` and show `#cartEmpty`.
11. IF `addToCart` is called with an `id` that does not exist in the Catalogue, THEN THE App SHALL take no action and display no Toast.

---

### Requirement 12: Cart Sidebar

**User Story:** As a user, I want a slide-in cart sidebar, so that I can review my cart without leaving the current page.

#### Acceptance Criteria

1. WHEN `openCart()` is called, THE App SHALL add the `open` CSS class to `#cartSidebar` and `#cartOverlay`, rendering the sidebar visible.
2. WHEN `closeCart()` is called, THE App SHALL remove the `open` CSS class from `#cartSidebar` and `#cartOverlay`.
3. WHEN the cart toggle button (`#cartToggle`) is clicked, THE App SHALL call `openCart()`.
4. WHEN `#cartOverlay` is clicked, THE App SHALL call `closeCart()`.
5. WHEN the cart sidebar is open and the Cart is modified, THE App SHALL re-render `#cartItems` to reflect the current Cart state.

---

### Requirement 13: Wishlist Management

**User Story:** As a user, I want to save products to a wishlist, so that I can revisit items I am interested in without adding them to my cart.

#### Acceptance Criteria

1. WHEN `toggleWishlist(id)` is called for a product not in the Wishlist, THE App SHALL add the product `id` to the Wishlist, update the wishlist Badge, persist the Wishlist to `localStorage` key `shopwave_wishlist`, and display a Toast: `"Added to wishlist"`.
2. WHEN `toggleWishlist(id)` is called for a product already in the Wishlist, THE App SHALL remove the product `id` from the Wishlist, update the wishlist Badge, persist the updated Wishlist to `localStorage`, and display a Toast: `"Removed from wishlist"`.
3. WHEN `toggleWishlist(id)` is called, THE App SHALL update the wishlist heart icon on the corresponding Product_Card to reflect the new state (filled if wishlisted, outline if not).
4. THE App SHALL initialise the wishlist Badge to the count of items in the restored Wishlist on page load.

---

### Requirement 14: Toast Notifications

**User Story:** As a user, I want brief, non-intrusive feedback messages, so that I know my actions (add to cart, wishlist, subscribe) have been registered.

#### Acceptance Criteria

1. WHEN a Toast is triggered, THE App SHALL set the `#toast` element's text content to the provided message and add the `show` CSS class.
2. WHEN a Toast is shown, THE App SHALL automatically remove the `show` CSS class after 2500 milliseconds.
3. WHEN a new Toast is triggered while a previous Toast is still visible, THE App SHALL reset the 2500 ms timer and update the message to the new one.

---

### Requirement 15: Newsletter Subscription

**User Story:** As a user, I want to subscribe to the newsletter with my email address, so that I receive exclusive deals and updates.

#### Acceptance Criteria

1. WHEN `subscribeNL()` is called with a non-empty, valid email address in `#nlEmail`, THE App SHALL display a Toast: `"🎉 You're subscribed! Check your inbox."` and clear the `#nlEmail` input.
2. IF `subscribeNL()` is called with an empty or invalid email address, THEN THE App SHALL display a Toast: `"Please enter a valid email address."` and NOT clear the input.
3. WHEN the user presses the Enter key while focused on `#nlEmail`, THE App SHALL call `subscribeNL()`.

---

### Requirement 16: Back to Top Button

**User Story:** As a user, I want a back-to-top button that appears when I scroll down, so that I can quickly return to the top of the page.

#### Acceptance Criteria

1. WHEN the user scrolls more than 400 pixels from the top of the page, THE App SHALL make the `#backToTop` button visible by adding an `active` or `visible` CSS class.
2. WHEN the user scrolls to within 400 pixels of the top of the page, THE App SHALL hide the `#backToTop` button by removing the class.
3. WHEN `#backToTop` is clicked, THE App SHALL scroll the viewport to the top with smooth behaviour.

---

### Requirement 17: Category Navigation Active State

**User Story:** As a user, I want the active category to be visually highlighted in the navigation bar, so that I always know which category I am browsing.

#### Acceptance Criteria

1. WHEN the page loads, THE App SHALL set the `all` Category_Nav link to the `active` CSS class.
2. WHEN `filterCat(cat)` is called, THE App SHALL remove the `active` class from all Category_Nav links and add it to the link whose `data-cat` attribute matches `cat`.
3. WHEN `doSearch()` is called, THE App SHALL remove the `active` class from all Category_Nav links.

---

### Requirement 18: Flash Sale Product Grid

**User Story:** As a user, I want to see a curated set of discounted products in the Flash Sale section, so that I can quickly spot the best deals.

#### Acceptance Criteria

1. WHEN the page loads, THE App SHALL render all Flash_Sale_Products (up to 8) into Flash_Grid as Product_Cards.
2. WHEN a Flash Sale Product_Card's "Add to Cart" button is clicked, THE App SHALL call `addToCart(id)` for that product.
3. WHEN a Flash Sale Product_Card's wishlist button is clicked, THE App SHALL call `toggleWishlist(id)` for that product.
4. THE App SHALL display Flash_Sale_Products with their discount percentage prominently shown on the card badge.

---

### Requirement 19: Responsive Layout Support

**User Story:** As a user browsing on a mobile or tablet device, I want the layout to adapt gracefully, so that I can shop comfortably on any screen size.

#### Acceptance Criteria

1. WHILE the viewport width is less than 768 pixels, THE App SHALL ensure the search category dropdown and search input remain usable and the header does not overflow horizontally.
2. WHILE the viewport width is less than 768 pixels, THE App SHALL ensure the cart sidebar width does not exceed 100% of the viewport width.
3. THE products-grid SHALL use CSS `auto-fill` with a minimum column width of 220 pixels so that the number of columns adjusts automatically to the viewport width.

---

### Requirement 20: Data Integrity and Error Resilience

**User Story:** As a developer, I want the App to handle malformed data and unexpected states gracefully, so that the site never crashes for end users.

#### Acceptance Criteria

1. IF `localStorage.getItem('shopwave_cart')` returns a non-JSON string, THEN THE App SHALL catch the parse error, initialise the Cart as an empty array, and continue without throwing an uncaught exception.
2. IF `localStorage.getItem('shopwave_wishlist')` returns a non-JSON string, THEN THE App SHALL catch the parse error, initialise the Wishlist as an empty array, and continue without throwing an uncaught exception.
3. IF a product referenced in the persisted Cart no longer exists in the Catalogue, THEN THE App SHALL silently remove that item from the Cart on load.
4. THE App SHALL not use `eval()` or `innerHTML` with unsanitised user input at any point.
