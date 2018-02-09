import assertRevert, { assertError } from './helpers/assertRevert'

import getEIP820 from './helpers/getEIP820'

const BigNumber = web3.BigNumber

const WeightedAssetRegistryTest = artifacts.require('WeightedAssetRegistryTest')
const Holder = artifacts.require('Holder')
const NonHolder = artifacts.require('NonHolder')

const NONE = '0x0000000000000000000000000000000000000000'

function checkTransferLog(
  log,
  assetId,
  from,
  to,
  operator,
  userData,
  operatorData
) {
  log.event.should.be.eq('Transfer')
  log.args.assetId.should.be.bignumber.equal(assetId)
  log.args.from.should.be.equal(from)
  log.args.to.should.be.equal(to)
  log.args.operator.should.be.equal(operator)
  log.args.userData.should.be.equal(userData)
  log.args.operatorData.should.be.equal(operatorData)
}

function checkAuthorizationLog(log, operator, holder, authorized) {
  log.event.should.be.eq('AuthorizeOperator')
  log.args.operator.should.be.bignumber.equal(operator)
  log.args.holder.should.be.equal(holder)
  log.args.authorized.should.be.equal(authorized)
}

function checkUpdateLog(log, assetId, holder, operator) {
  log.event.should.be.eq('Update')
  log.args.assetId.should.be.bignumber.equal(assetId)
  log.args.holder.should.be.equal(holder)
  log.args.operator.should.be.equal(operator)
}

function checkCreateLog(log, holder, assetId, operator, data) {
  log.event.should.be.eq('Transfer')
  log.args.from.should.be.equal(NONE)
  log.args.to.should.be.equal(holder)
  log.args.assetId.should.be.bignumber.equal(assetId)
  log.args.operator.should.be.equal(operator)
  log.args.userData.should.be.equal(data)
}

function checkDestroyLog(log, holder, assetId, operator) {
  log.event.should.be.eq('Transfer')
  log.args.from.should.be.equal(holder)
  log.args.to.should.be.equal(NONE)
  log.args.assetId.should.be.bignumber.equal(assetId)
  log.args.operator.should.be.equal(operator)
}

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('WeightedAssetRegistryTest', accounts => {
  const [creator, user, anotherUser, operator, mallory] = accounts
  let registry = null
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
    EIP820 = await getEIP820(creator)
    await registry.generate(0, creator, CONTENT_DATA, sentByCreator)
    await registry.generate(1, creator, CONTENT_DATA, sentByCreator)
    await registry.changeWeight(0, 100, sentByCreator)
    await registry.changeWeight(1, 250, sentByCreator)
  })


  describe('Weight', () => {
    it('is weighted', async () => {
      const isWeighted = await registry.isWeighted()

      isWeighted.should.be.equal(true)
    })
    it('has a total weight equal to the created weight', async () => {
      const totalWeight = await registry.totalWeight()

      totalWeight.should.be.bignumber.equal(350)
    })
    it('has asset weight equal to the creation weight', async () => {
      const assetWeight0 = await registry.weightOfAsset(0)
      const assetWeight1 = await registry.weightOfAsset(1)

      assetWeight0.should.be.bignumber.equal(100);
      assetWeight1.should.be.bignumber.equal(250);
    })
    it('has a holder weight equal to their holdings', async () => {
      const holderWeight = await registry.weightOfHolder(creator)

      holderWeight.should.be.bignumber.equal(350)
    })
  })

  describe('Accounting', () => {
    it('Changes the weight of an asset', async () => {
      await registry.changeWeight(0, 0, sentByCreator)

      const assetWeight0 = await registry.weightOfAsset(0)
      const totalWeight = await registry.totalWeight()

      assetWeight0.should.be.bignumber.equal(0)
      totalWeight.should.be.bignumber.equal(250)
    })
    it('Transfers an asset', async () => {
      await registry.transfer(mallory, 1, sentByCreator)

      const creatorWeight = await registry.weightOfHolder(creator)
      const malloryWeight = await registry.weightOfHolder(mallory)
      const totalWeight = await registry.totalWeight()

      creatorWeight.should.be.bignumber.equal(100)
      malloryWeight.should.be.bignumber.equal(250)
      totalWeight.should.be.bignumber.equal(350)
    })
    it('Destroys an asset - moo hoo whahaha', async () => {
      const oldWeight = await registry.totalWeight();
      const assetWeight = await registry.weightOfAsset(1);
      await registry.destroy(1);
      const newWeight = await registry.totalWeight();

      newWeight.should.be.bignumber.equal(oldWeight - assetWeight)
    })
  })
})

