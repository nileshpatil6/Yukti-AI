class MockPrismaModel {
  name: string
  static dbStore = new Map()

  constructor(name: string) {
    this.name = name
    if (!MockPrismaModel.dbStore.has(name)) {
      MockPrismaModel.dbStore.set(name, [])
    }
  }

  get data(): any[] { return MockPrismaModel.dbStore.get(this.name) }
  set data(val: any[]) { MockPrismaModel.dbStore.set(this.name, val) }

  async findMany(args?: any) { return this.data.slice() || [] }
  async findUnique(args?: any) { return this.data[0] || null }
  async findFirst(args?: any) { return this.data[0] || null }

  async create(args: any) {
    const entry = { id: Math.random().toString(36).substr(2, 9), createdAt: new Date(), updatedAt: new Date(), ...args?.data }
    this.data.push(entry)
    return entry
  }

  async update(args: any) {
    if (this.data.length > 0) {
      this.data[0] = { ...this.data[0], ...args?.data, updatedAt: new Date() }
      return this.data[0]
    }
    return null
  }

  async delete(args?: any) { return true }
  async deleteMany(args?: any) { this.data = []; return true }
}

export const prisma = new Proxy({}, {
  get: (target: any, prop: string) => {
    if (prop === '$connect' || prop === '$disconnect') return async () => { }
    if (prop === '$transaction') return async (promises: any[]) => Promise.all(promises)
    if (!target[prop]) target[prop] = new MockPrismaModel(prop)
    return target[prop]
  }
}) as any
