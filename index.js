const child_process = require('child_process')
const promisify = require('util').promisify

const execFile = promisify(child_process.execFile)

module.exports = async function () {
    let result = []
    if (process.platform === 'win32') {
        const { stdout } = await execFile('tasklist', ['/fo', 'CSV'])
        console.log(stdout)
        result = stdout.split('\n')
            .filter(line => !!line.trim()) // 过滤空行
            .map((line) => {
                const p = line.trim().replace(/\"/g, '').split(',')
                return {
                    pid: parseInt(p[1]),
                    name: p[0]
                }
            }).splice(1)
    } else {
        const spawnChild = async () => {
            const child = child_process.spawn('ps', ['-ax', '-o', 'pid,comm'])
            let data = ''
            for await (const chunk of child.stdout) {
                data += chunk
            }
            return data
        }

        result = (await spawnChild()).split('\n')
            .filter(line => !!line.trim())
            .map(line => {
                const p = line.trim().split(/\s+/)
                return {
                    pid: parseInt(p[0]),
                    name: p[1]
                }
            }).splice(1)
    }
    return result
}
