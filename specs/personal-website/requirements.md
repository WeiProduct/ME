# Personal Website Requirements

## Project Overview
A professional portfolio website for Wei Fu (WeiProduct) showcasing technical expertise in Computer Science and business acumen in Managerial Economics through projects, iOS applications, and professional achievements.

## User Stories and Requirements

### 1. Homepage and Navigation
**User Story:** As a visitor, I want to immediately understand Wei Fu's professional identity and easily navigate to different sections of the website.

**Acceptance Criteria (EARS format):**
- WHEN the website loads, the system SHALL display a hero section with Wei Fu's name, professional title, and a brief tagline highlighting the dual major background
- WHERE navigation is concerned, the system SHALL provide a responsive navigation menu accessible from all pages
- WHILE on mobile devices, the system SHALL transform the navigation into a hamburger menu
- IF a user clicks any navigation link, the system SHALL smoothly scroll to the corresponding section (for single-page design) or navigate to the appropriate page

### 2. About Section
**User Story:** As a potential employer or collaborator, I want to learn about Wei Fu's educational background and professional journey.

**Acceptance Criteria (EARS format):**
- WHEN viewing the About section, the system SHALL display information about the dual major in Computer Science (Primary) and Managerial Economics (Second Major)
- WHERE the education is mentioned, the system SHALL clearly indicate graduation status and year
- IF available, the system SHALL include a professional photo and brief bio
- WHEN content is provided, the system SHALL highlight the unique value proposition of combining technical and business expertise

### 3. GitHub Projects Showcase
**User Story:** As a technical recruiter or developer, I want to explore Wei Fu's GitHub projects to assess coding skills and project diversity.

**Acceptance Criteria (EARS format):**
- WHEN the Projects section loads, the system SHALL automatically fetch and display repositories from the GitHub user "WeiProduct"
- WHERE each project is displayed, the system SHALL show:
  - Project name and description
  - Primary programming language
  - Number of stars and forks
  - Last updated date
  - Live demo link (if available)
  - Direct link to GitHub repository
- WHILE fetching data, the system SHALL display a loading indicator
- IF the GitHub API request fails, the system SHALL display cached project data or a friendly error message
- WHEN a user clicks on a project card, the system SHALL provide detailed project information in a modal or expanded view

### 4. iOS App Portfolio
**User Story:** As a potential user or investor, I want to see the iOS applications Wei Fu has developed.

**Acceptance Criteria (EARS format):**
- WHEN viewing the iOS Apps section, the system SHALL display all 10 mentioned apps in an organized grid or carousel
- WHERE each app is shown, the system SHALL include:
  - App icon
  - App name (AIMBTi, AI上视打牢系统, AI实想, TouchGrass, AI的合助手, AI卡路里, WeathersPro, WellRabits, AI互历, PiggyFinance)
  - Brief description
  - Key features or technologies used
  - App Store link (if available)
- IF screenshots are available, the system SHALL display them in a gallery view
- WHEN on mobile devices, the system SHALL ensure app icons and text remain clearly visible

### 5. Skills and Technologies
**User Story:** As a hiring manager, I want to quickly assess Wei Fu's technical skills and business competencies.

**Acceptance Criteria (EARS format):**
- WHEN viewing the Skills section, the system SHALL categorize skills into:
  - Programming Languages
  - Frameworks and Technologies
  - Business and Economics Skills
  - Tools and Platforms
- WHERE skills are displayed, the system SHALL use visual indicators (progress bars, tags, or badges) to show proficiency levels
- IF applicable, the system SHALL highlight certifications or special achievements

### 6. Contact Section
**User Story:** As an interested party, I want to easily contact Wei Fu for opportunities or collaborations.

**Acceptance Criteria (EARS format):**
- WHEN viewing the Contact section, the system SHALL provide:
  - Professional email address
  - LinkedIn profile link
  - GitHub profile link
  - Contact form with fields for name, email, subject, and message
- WHERE the contact form is submitted, the system SHALL validate all required fields
- AFTER successful submission, the system SHALL display a confirmation message
- IF form submission fails, the system SHALL show an error message with alternative contact methods

### 7. Responsive Design
**User Story:** As a user on any device, I want the website to be fully functional and visually appealing.

**Acceptance Criteria (EARS format):**
- WHEN viewed on devices with screen width ≥ 1200px, the system SHALL display desktop layout
- WHEN viewed on devices with screen width 768px-1199px, the system SHALL display tablet layout
- WHEN viewed on devices with screen width < 768px, the system SHALL display mobile layout
- WHERE images are used, the system SHALL implement lazy loading for performance
- WHILE scrolling, the system SHALL maintain smooth performance with no janky animations

### 8. Performance and SEO
**User Story:** As a website owner, I want the site to load quickly and rank well in search engines.

**Acceptance Criteria (EARS format):**
- WHEN the page loads, the system SHALL achieve a Lighthouse performance score of at least 90
- WHERE SEO is concerned, the system SHALL include:
  - Proper meta tags for all pages
  - Open Graph tags for social media sharing
  - Structured data for personal/professional information
  - Sitemap.xml file
- WHILE loading, the system SHALL display content within 3 seconds on 3G connections

### 9. GitHub Pages Deployment
**User Story:** As the website owner, I want the site to be easily deployable and maintainable on GitHub Pages.

**Acceptance Criteria (EARS format):**
- WHEN deploying, the system SHALL be compatible with GitHub Pages static hosting
- WHERE the repository is concerned, the system SHALL be hosted at https://github.com/WeiProduct/ME.git
- IF using a build process, the system SHALL include clear deployment instructions
- WHEN updates are pushed to the main branch, the system SHALL automatically deploy to GitHub Pages

## Non-Functional Requirements

### Accessibility
- The system SHALL meet WCAG 2.1 Level AA compliance
- The system SHALL support keyboard navigation for all interactive elements
- The system SHALL provide appropriate ARIA labels for screen readers

### Browser Compatibility
- The system SHALL support the latest versions of Chrome, Firefox, Safari, and Edge
- The system SHALL provide graceful degradation for older browsers

### Security
- The system SHALL use HTTPS for all resources
- The system SHALL sanitize all user inputs in the contact form
- The system SHALL not expose sensitive API keys or credentials

### Maintenance
- The system SHALL use a modular architecture for easy updates
- The system SHALL include comprehensive documentation
- The system SHALL use version control for all code and assets