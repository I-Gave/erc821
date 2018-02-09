import assertRevert, { assertError } from './helpers/assertRevert'

import getEIP820 from './helpers/getEIP820'

const BigNumber = web3.BigNumber

const DARAdapter = artifacts.require('DARAdapter')
const WeightedAssetRegistryTest = artifacts.require('WeightedAssetRegistryTest')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('DAR Adapter Test', accounts => {
  const [creator, user, anotherUser, operator, mallory] = accounts
  let registry = null
  let adapter = null
  let EIP820 = null
  const _name = 'Test'
  const _symbol = 'TEST'
  const _description = 'lorem ipsum'
  const _firstAssetlId = 1
  const alternativeAsset = { id: 2, data: 'data2' }
  const sentByCreator = { from: creator }
  const sentByUser = { from: user }
  const creationParams = {
    gas: 4e6,
    gasPrice: 21e9,
    from: creator
  }
  const CONTENT_DATA = 'test data'

  beforeEach(async () => {
    registry = await WeightedAssetRegistryTest.new(creationParams)

    await registry.generate(0, creator, CONTENT_DATA, 100, sentByCreator)
    await registry.generate(1, creator, CONTENT_DATA, 250, sentByCreator)

    adapter = await DARAdapter.new(registry.address, creationParams)
  })

  describe('DAR Adapter', () => {
    it('Points to the DAR', async () => {
      const voteWeightAddress = await adapter.voteWeightAddress();

      voteWeightAddress.should.be.equal(registry.address)
    })
  })

})

