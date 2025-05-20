// Configuration - Change this to your GitHub username
const GITHUB_USERNAME = "ttv-voidgg"

// DOM Elements
const loadingElement = document.getElementById("loading")
const errorElement = document.getElementById("error")
const noReposElement = document.getElementById("no-repos")
const blogContainer = document.getElementById("blog-container")
const repoTemplate = document.getElementById("repo-template")

// Add a debug counter to the page
const debugDiv = document.createElement("div")
debugDiv.style.position = "fixed"
debugDiv.style.top = "10px"
debugDiv.style.right = "10px"
debugDiv.style.background = "rgba(0,0,0,0.7)"
debugDiv.style.color = "white"
debugDiv.style.padding = "10px"
debugDiv.style.borderRadius = "5px"
debugDiv.style.zIndex = "1000"
document.body.appendChild(debugDiv)
debugDiv.style.display = "none"

// Debug function to log to both console and screen
function debug(message) {
    console.log(message)
    debugDiv.innerHTML += `<div>${message}</div>`

    // Keep only the last 10 messages
    const messages = debugDiv.querySelectorAll("div")
    if (messages.length > 10) {
        for (let i = 0; i < messages.length - 10; i++) {
            debugDiv.removeChild(messages[i])
        }
    }
}

// Format date to "time ago" format
function formatTimeAgo(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)

    if (years > 0) return years === 1 ? "1 year ago" : `${years} years ago`
    if (months > 0) return months === 1 ? "1 month ago" : `${months} months ago`
    if (days > 0) return days === 1 ? "1 day ago" : `${days} days ago`
    if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`
    if (minutes > 0) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`
    return seconds <= 1 ? "just now" : `${seconds} seconds ago`
}

// Generate a banner image URL based on repository information
function generateBannerImage(repo) {
    // Try different sources for banner images in order of preference

    // 1. If the repo has a custom image in the processed data, use that
    if (repo.image && repo.image.startsWith("http")) {
        return repo.image
    }

    // 2. Use GitHub's OpenGraph image (shows code and repo info)
    const githubOgImage = `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`

    // 3. Alternative: Use a service like Unsplash to get a relevant image based on repo language or name
    // const unsplashImage = `https://source.unsplash.com/800x400/?${repo.language || 'code'}`

    // 4. Alternative: Use a placeholder service with repo name
    // const placeholderImage = `https://via.placeholder.com/800x400/0046c8/FFFFFF?text=${encodeURIComponent(repo.name)}`

    return githubOgImage
}

// Parse YAML frontmatter from README content
function parseFrontmatter(content) {
    try {
        // Check if content is null or undefined
        if (!content) return null

        // Log the first 100 characters of the content for debugging
        debug(`README content starts with: ${content.substring(0, 100)}...`)

        // Check for frontmatter with a more flexible regex
        const frontmatterMatch = content.match(/^\s*---\s*\n([\s\S]*?)\n\s*---/)
        if (!frontmatterMatch) {
            debug("No frontmatter found in README")
            return null
        }

        const frontmatter = frontmatterMatch[1]
        debug(`Found frontmatter: ${frontmatter.substring(0, 100)}...`)

        const frontmatterLines = frontmatter.split("\n")
        const metadata = {}

        let isInNestedObject = false
        let nestedObjectKey = null
        let nestedObject = {}

        frontmatterLines.forEach((line) => {
            // Skip empty lines
            if (!line.trim()) return

            // Check if this is a nested object start
            if (line.match(/^\s*\w+:\s*$/)) {
                isInNestedObject = true
                nestedObjectKey = line.trim().replace(":", "")
                nestedObject = {}
                return
            }

            // If we're in a nested object
            if (isInNestedObject && line.match(/^\s+\w+:/)) {
                const parts = line.trim().split(":")
                const nestedKey = parts[0].trim()
                const nestedValue = parts.slice(1).join(":").trim()
                nestedObject[nestedKey] = nestedValue
                return
            }

            // If this line doesn't have indentation and we were in a nested object,
            // it means the nested object has ended
            if (isInNestedObject && !line.startsWith(" ")) {
                if (nestedObjectKey) {
                    metadata[nestedObjectKey] = nestedObject
                }
                isInNestedObject = false
                nestedObjectKey = null
                nestedObject = {}
            }

            // Regular key-value pair
            if (line.includes(":")) {
                const parts = line.split(":")
                const key = parts[0].trim()
                const value = parts.slice(1).join(":").trim()
                metadata[key] = value
            }
        })

        // If we were still in a nested object at the end, save it
        if (isInNestedObject && nestedObjectKey) {
            metadata[nestedObjectKey] = nestedObject
        }

        debug(`Parsed metadata: ${JSON.stringify(metadata)}`)
        return metadata
    } catch (error) {
        debug(`Error parsing frontmatter: ${error.message}`)
        return null
    }
}

// Process README content to extract repository data
function processReadme(content, repo) {
    try {
        const metadata = parseFrontmatter(content)
        if (!metadata) {
            // If no frontmatter is found, create a basic repository object with default values
            return {
                name: repo.name,
                title: repo.name,
                description: repo.description || `A GitHub repository by ${GITHUB_USERNAME}`,
                date: repo.pushed_at || repo.updated_at || repo.created_at,
                lastCommitDate: repo.pushed_at || repo.updated_at,
                image: generateBannerImage(repo),
                site_url: repo.site ||"https://webdev.eejay.me",
                category: repo.language || "Project",
                author: {
                    name: GITHUB_USERNAME,
                    role: "Developer",
                    avatar: `https://github.com/${GITHUB_USERNAME}.png`,
                },
                url: repo.html_url,
            }
        }

        return {
            name: repo.name,
            title: metadata.title || repo.name,
            description: metadata.description || repo.description || "",
            date: metadata.date || repo.pushed_at || repo.updated_at || repo.created_at,
            lastCommitDate: repo.pushed_at || repo.updated_at,
            image: metadata.image || generateBannerImage(repo),
            site_url: metadata.site ||"https://webdev.eejay.me",
            category: metadata.category || repo.language || "Project",
            author: metadata.author || {
                name: GITHUB_USERNAME,
                role: "Developer",
                avatar: `https://github.com/${GITHUB_USERNAME}.png`,
            },
            url: repo.html_url,
        }
    } catch (error) {
        console.error(`Error parsing README for ${repo.name}:`, error)
        // Return a basic repository object with default values
        return {
            name: repo.name,
            title: repo.name,
            description: repo.description || `A GitHub repository by ${GITHUB_USERNAME}`,
            date: repo.pushed_at || repo.updated_at || repo.created_at,
            lastCommitDate: repo.pushed_at || repo.updated_at,
            image: generateBannerImage(repo),
            site_url: repo.site ||"https://webdev.eejay.me",
            category: repo.language || "Project",
            author: {
                name: GITHUB_USERNAME,
                role: "Developer",
                avatar: `https://github.com/${GITHUB_USERNAME}.png`,
            },
            url: repo.html_url,
        }
    }
}

// Create repository article element
function createRepoElement(repo, index) {
    // Clone the template
    const clone = repoTemplate.content.cloneNode(true)

    // Add a debug class and index
    const article = clone.querySelector("article")
    article.classList.add("repo-item")
    article.dataset.index = index
    article.style.border = "1px solid #e5e7eb"
    article.style.padding = "20px"
    article.style.marginBottom = "20px"

    // Set image
    const imageElement = clone.querySelector(".repo-image")
    imageElement.src = repo.image || generateBannerImage(repo)
    imageElement.alt = repo.name

    // Improve image display
    imageElement.style.objectFit = "cover"
    imageElement.style.objectPosition = "center"

    // Set date
    const dateElement = clone.querySelector(".repo-date")
    dateElement.textContent = formatTimeAgo(repo.lastCommitDate || repo.date || new Date().toISOString())
    dateElement.setAttribute("datetime", new Date(repo.lastCommitDate || repo.date || new Date()).toISOString())

    // Set category
    const categoryElement = clone.querySelector(".repo-category")
    categoryElement.textContent = repo.language || "Project"
    categoryElement.href = `${repo.html_url}/topics`

    // Set title and link
    const titleElement = clone.querySelector(".repo-title")
    titleElement.textContent = repo.title || repo.name

    const linkElement = clone.querySelector(".repo-link")
    linkElement.href = repo.url || repo.html_url

    // Set description
    const descriptionElement = clone.querySelector(".repo-description")
    descriptionElement.textContent = repo.description || `A GitHub repository by ${GITHUB_USERNAME}`

    // Set site_url
    const siteurlElement = clone.querySelector(".site-url")
    siteurlElement.textContent = repo.site_url || ''
    siteurlElement.href = repo.site_url || 'https://webdev.eejay.me'

    // Set author info
    const authorAvatar = clone.querySelector(".author-avatar")
    authorAvatar.src = repo.author?.avatar || `https://github.com/${GITHUB_USERNAME}.png`

    const authorName = clone.querySelector(".author-name")
    authorName.textContent = repo.author?.name || GITHUB_USERNAME

    const authorRole = clone.querySelector(".author-role")
    authorRole.textContent = repo.author?.role || "Developer"

    const authorLink = clone.querySelector(".author-link")
    authorLink.href = `https://github.com/${GITHUB_USERNAME}`

    return clone
}

// Fetch repositories directly from GitHub API
async function fetchRepositories() {
    debug("Starting to fetch repositories...")

    try {
        // First, try to get the total number of repositories
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
        if (!userResponse.ok) {
            throw new Error(`Failed to fetch user data: ${userResponse.status}`)
        }

        const userData = await userResponse.json()
        const totalRepos = userData.public_repos
        debug(`User has ${totalRepos} public repositories`)

        // Now fetch all repositories with a high per_page value
        // Sort by pushed (last commit) date
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`)
        if (!reposResponse.ok) {
            throw new Error(`Failed to fetch repositories: ${reposResponse.status}`)
        }

        const repos = await reposResponse.json()
        debug(`Fetched ${repos.length} repositories from API`)

        // Check if we need pagination (if user has more than 100 repos)
        let allRepos = repos
        if (totalRepos > 100) {
            debug("User has more than 100 repos, fetching additional pages...")

            // Calculate how many additional pages we need
            const totalPages = Math.ceil(totalRepos / 100)

            // Fetch additional pages
            for (let page = 2; page <= totalPages; page++) {
                debug(`Fetching page ${page} of ${totalPages}...`)
                const pageResponse = await fetch(
                    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=pushed`,
                )
                if (pageResponse.ok) {
                    const pageRepos = await pageResponse.json()
                    allRepos = allRepos.concat(pageRepos)
                    debug(`Added ${pageRepos.length} repos from page ${page}`)
                } else {
                    debug(`Failed to fetch page ${page}: ${pageResponse.status}`)
                }
            }
        }

        // Filter repositories to only include those where you are the owner AND it's not a fork
        const ownedRepos = allRepos.filter((repo) => {
            // Check if the owner's login matches your username AND it's not a fork
            return repo.owner && repo.owner.login === GITHUB_USERNAME && repo.fork === false
        })

        debug(`Total repositories after filtering (only owned, non-forked): ${ownedRepos.length}`)

        // Log the pushed_at dates for debugging
        ownedRepos.forEach((repo) => {
            debug(`Repo: ${repo.name}, Last Push: ${repo.pushed_at}, Last Update: ${repo.updated_at}`)
        })

        return ownedRepos
    } catch (error) {
        debug(`Error fetching repositories: ${error.message}`)
        throw error
    }
}

// Fetch README content for a repository
async function fetchReadmeContent(repo) {
    debug(`Fetching README for ${repo.name}...`)

    try {
        // Try main branch first
        const mainReadmeResponse = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo.name}/main/README.md`,
        )

        if (mainReadmeResponse.ok) {
            const content = await mainReadmeResponse.text()
            debug(`Found README in main branch for ${repo.name}`)
            return content
        }

        // Try master branch if main failed
        const masterReadmeResponse = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo.name}/master/README.md`,
        )

        if (masterReadmeResponse.ok) {
            const content = await masterReadmeResponse.text()
            debug(`Found README in master branch for ${repo.name}`)
            return content
        }

        // No README found
        debug(`No README found for ${repo.name}`)
        return null
    } catch (error) {
        debug(`Error fetching README for ${repo.name}: ${error.message}`)
        return null
    }
}

// Main function to fetch and display repositories
async function displayRepositories() {
    try {
        // Clear any existing content
        blogContainer.innerHTML = ""

        // Show loading indicator
        loadingElement.classList.remove("hidden")
        errorElement.classList.add("hidden")
        noReposElement.classList.add("hidden")

        // Fetch repositories
        const repositories = await fetchRepositories()

        if (!repositories || repositories.length === 0) {
            debug("No repositories found")
            noReposElement.classList.remove("hidden")
            return
        }

        debug(`Preparing to render ${repositories.length} repositories`)

        // Process repositories with README data
        const processedRepos = []

        for (const repo of repositories) {
            // Fetch README content
            const readmeContent = await fetchReadmeContent(repo)

            // Process repository with or without README
            if (readmeContent) {
                const processedRepo = processReadme(readmeContent, repo)
                processedRepos.push(processedRepo)
            } else {
                // Create a basic repository object with default values
                processedRepos.push({
                    name: repo.name,
                    title: repo.name,
                    description: repo.description || `A GitHub repository by ${GITHUB_USERNAME}`,
                    date: repo.pushed_at || repo.updated_at || repo.created_at,
                    lastCommitDate: repo.pushed_at || repo.updated_at,
                    image: generateBannerImage(repo),
                    category: repo.language || "Project",
                    author: {
                        name: GITHUB_USERNAME,
                        role: "Developer",
                        avatar: `https://github.com/${GITHUB_USERNAME}.png`,
                    },
                    url: repo.html_url,
                })
            }
        }

        // Sort repositories by last commit date (newest first)
        processedRepos.sort((a, b) => {
            const dateA = new Date(a.lastCommitDate || a.date || 0)
            const dateB = new Date(b.lastCommitDate || b.date || 0)
            return dateB - dateA // Descending order (newest first)
        })

        // Render each repository
        processedRepos.forEach((repo, index) => {
            debug(`Rendering repository ${index + 1}/${processedRepos.length}: ${repo.name}`)
            const repoElement = createRepoElement(repo, index)
            blogContainer.appendChild(repoElement)
        })

        // Count how many repositories were actually rendered
        const renderedRepos = document.querySelectorAll(".repo-item").length
        debug(`Actually rendered ${renderedRepos} repositories`)

        // Show the blog container
        blogContainer.classList.add("loaded")

        // Final check to make sure repositories are visible
        setTimeout(() => {
            const finalCount = document.querySelectorAll(".repo-item").length
            debug(`Final repository count: ${finalCount}`)

            // Force display of all repositories
            document.querySelectorAll(".repo-item").forEach((item) => {
                item.style.display = "flex"
                item.style.opacity = "1"
            })
        }, 1000)
    } catch (error) {
        debug(`Error in displayRepositories: ${error.message}`)
        errorElement.textContent = `Error: ${error.message}`
        errorElement.classList.remove("hidden")
    } finally {
        loadingElement.classList.add("hidden")
    }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
    debug("Page loaded, starting repository fetch")
    displayRepositories()
})
