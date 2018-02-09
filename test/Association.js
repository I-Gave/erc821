import assertRevert, { assertError } from './helpers/assertRevert'

import getEIP820 from './helpers/getEIP820'

const BigNumber = web3.BigNumber

const Association = artifacts.require('Association')
const DARAdapter = artifacts.require('DARAdapter')
const WeightedAssetRegistryTest = artifacts.require('WeightedAssetRegistryTest')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('DAO Test', accounts => {
  const [creator, user, anotherUser, operator, mallory] = accounts
  let registry = null
  let adapter = null
  let association = null
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
    association = await Association.new(adapter.address, 100, 0);
  })

  describe('DAR Adapter', () => {
    it('Token voting points to the adapter', async () => {
      const tokenVotingAddress = await association.sharesTokenAddress();

      tokenVotingAddress.should.be.equal(adapter.address)
    })
    it('Creates a new proposal',  async () => {
      await association.newProposal(
        creator,
        0,
        'Test Proposal',
        ''
      )

      const newProposal = await association.proposals(0);

      newProposal[0].should.be.equal(creator);
      newProposal[1].should.be.bignumber.equal(0);
      newProposal[2].should.be.equal('Test Proposal');
    })
    it('Votes on a proposal',  async () => {
      await association.newProposal(
        creator,
        0,
        'Test Proposal',
        ''
      )

      await association.vote(0, true)

      const newProposal = await association.proposals(0);

      newProposal[0].should.be.equal(creator);
      newProposal[1].should.be.bignumber.equal(0);
      newProposal[2].should.be.equal('Test Proposal');
    })
  })

})

