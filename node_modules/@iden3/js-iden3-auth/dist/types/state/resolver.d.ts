import { ICache } from '../cache';
export type Resolvers = {
    [key: string]: IStateResolver;
};
export interface IStateResolver {
    resolve(id: bigint, state: bigint): Promise<ResolvedState>;
    rootResolve(state: bigint): Promise<ResolvedState>;
}
export type ResolvedState = {
    latest: boolean;
    genesis: boolean;
    state: unknown;
    transitionTimestamp: number | string;
};
/**
 * Configuration options for caching behavior
 */
type ResolverCacheOptions = {
    /** TTL in milliseconds for latest states/roots (shorter since they can change) */
    notReplacedTtl?: number;
    /** TTL in milliseconds for historical states/roots (longer since they're they can change with less probability) */
    replacedTtl?: number;
    /** Maximum number of entries to store in cache */
    maxSize?: number;
};
/**
 * Configuration options for the EthStateResolver
 */
export type ResolverOptions = {
    /** Configuration for state resolution caching */
    stateCacheOptions?: {
        /** Custom cache implementation (if not provided, uses in-memory cache) */
        cache?: ICache<ResolvedState>;
    } & ResolverCacheOptions;
    /** Configuration for GIST root resolution caching */
    rootCacheOptions?: {
        /** Custom cache implementation (if not provided, uses in-memory cache) */
        cache?: ICache<ResolvedState>;
    } & ResolverCacheOptions;
    /** Whether to skip fetch setup for the ethers provider */
    skipFetchSetup?: boolean;
};
/**
 * Ethereum-based state resolver that resolves identity states and GIST roots
 * from a smart contract deployed on an Ethereum-compatible blockchain.
 *
 * This resolver caches results with different TTL values:
 * - Latest states/roots: shorter TTL since they can transition to historical
 * - Historical states/roots: longer TTL since they are immutable once replaced
 */
export declare class EthStateResolver implements IStateResolver {
    private _contract;
    private _stateResolveCache;
    private _rootResolveCache;
    private _stateCacheOptions;
    private _rootCacheOptions;
    /**
     * Creates a new EthStateResolver instance
     * @param rpcUrl - The RPC URL for the Ethereum-compatible blockchain
     * @param contractAddress - The address of the state contract
     * @param options - Optional configuration for caching and provider setup
     */
    constructor(rpcUrl: string, contractAddress: string, options?: ResolverOptions);
    private getCacheKey;
    private getRootCacheKey;
    resolve(id: bigint, state: bigint): Promise<ResolvedState>;
    private performResolve;
    rootResolve(root: bigint): Promise<ResolvedState>;
    private performRootResolve;
}
export declare function isGenesisStateId(id: bigint, state: bigint): boolean;
export {};
