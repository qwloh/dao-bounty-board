## Build

anchor build

## Deploy

solana program deploy ./target/deploy/dao_bounty_board.so --skip-fee-check

## Test

anchor test --skip-build --skip-deploy
