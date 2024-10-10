const jobstories = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json')

const jobstoriesdata = await Promise.all((await jobstories.json() as number[]).map(async (job) => {
  const jobdata = await fetch(`https://hacker-news.firebaseio.com/v0/item/${job}.json`)
  return jobdata.json()
}))

console.log(jobstoriesdata)