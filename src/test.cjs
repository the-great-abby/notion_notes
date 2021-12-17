//import { NotionAPI } from 'notion-client'
const { Client, LogLevel } = require("@notionhq/client")

console.log("api_token: ", process.env.NOTION_API_TOKEN);


// const databaseId = process.env.NOTION_DATABASE_ID
const OPERATION_BATCH_SIZE = 10

// regular page url (no database)
//const page_id = "test-area-de7200dd4e4e4419883492b93b2b84c2"
//const notion_url = "https://www.notion.so/"
//const page_url = notion_url + page_id
//console.log("Page URL: ", page_url)

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
  logLevel: LogLevel.DEBUG,
})
// const api = new NotionAPI(notion)

/********************** 
 * Log Level Options
 * ********************
 * DEBUG
 * INFO
 * WARN
 * ERROR
 */

// Inteegration Area table link
//const page_id = process.env.NOTION_PAGE_ID
const databaseId = process.env.NOTION_DB_ID
const notion_url = "https://www.notion.so/"
// fetch a notion page's content, including all async blocks, collection queries, and signed urls
// const page = await api.getPage(databaseId)
const page_url = notion_url + databaseId
console.log("Page URL: ", page_url)
console.log("databaseID: ", databaseId)

;(async () => {
  const listUsersResponse = await notion.users.list()
  console.log("==============================")
  console.log("Users")
  console.log("==============================")
  console.log(listUsersResponse)
})()
//;(async () => {
  //const listPagesResponse = await notion.pages.list()
  //console.log("==============================")
  //console.log("Pages")
  //console.log("==============================")
  //console.log(listPagesResponse)
//})()
;(async () => {
  const listDatabasesResponse = await notion.databases.list()
  console.log("==============================")
  console.log("Databases")
  console.log("==============================")
  console.log(listDatabasesResponse)
  console.log("databaseId",databaseId)
})()


async function addItem(text) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title:[
            {
              "text": {
                "content": text
              }
            }
          ]
        }
      },
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}

addItem("Yurts in Big Sur, California")

/**
 * Determines which issues already exist in the Notion database.
 *
 * @param {Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} issues
 * @returns {{
 *   pagesToCreate: Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>;
 *   pagesToUpdate: Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 * }}
 */
function getNotionOperations(issues) {
  const pagesToCreate = []
  const pagesToUpdate = []
  for (const issue of issues) {
    const pageId = gitHubIssuesIdToNotionPageId[issue.number]
    if (pageId) {
      pagesToUpdate.push({
        ...issue,
        pageId,
      })
    } else {
      pagesToCreate.push(issue)
    }
  }
  return { pagesToCreate, pagesToUpdate }
}

/**
 * Creates new pages in Notion.
 *
 * https://developers.notion.com/reference/post-page
 *
 * @param {Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} pagesToCreate
 */
async function createPages(pagesToCreate) {
  const pagesToCreateChunks = _.chunk(pagesToCreate, OPERATION_BATCH_SIZE)
  for (const pagesToCreateBatch of pagesToCreateChunks) {
    await Promise.all(
      pagesToCreateBatch.map(issue =>
        notion.pages.create({
          parent: { database_id: databaseId },
          properties: getPropertiesFromIssue(issue),
        })
      )
    )
    console.log(`Completed batch size: ${pagesToCreateBatch.length}`)
  }
}

/**
 * Updates provided pages in Notion.
 *
 * https://developers.notion.com/reference/patch-page
 *
 * @param {Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} pagesToUpdate
 */
async function updatePages(pagesToUpdate) {
  const pagesToUpdateChunks = _.chunk(pagesToUpdate, OPERATION_BATCH_SIZE)
  for (const pagesToUpdateBatch of pagesToUpdateChunks) {
    await Promise.all(
      pagesToUpdateBatch.map(({ pageId, ...issue }) =>
        notion.pages.update({
          page_id: pageId,
          properties: getPropertiesFromIssue(issue),
        })
      )
    )
    console.log(`Completed batch size: ${pagesToUpdateBatch.length}`)
  }
}
