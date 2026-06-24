<?php
namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;
use EssentialBlocks\Utils\Helper;
use EssentialBlocks\Utils\Settings;
use EssentialBlocks\Utils\HttpRequest;

/**
 * Facebook Feed block
 *
 * Server-renders posts fetched from the Facebook Graph API. Mirrors the
 * Instagram Feed sibling: token from eb_settings, transient cache, view
 * templates under views/fb-partials/.
 *
 * Pro extension surface (Phase 8 of the plan doc): query_args, graph_fields,
 * cache_ttl, raw_response, posts, post_markup, before_render, after_render.
 * Pro listens to these to layer in extra layouts, filtering, and AJAX paging
 * without forking the free block.
 *
 * @see .claude/docs/features/integrations/facebook-feed.md
 */
class FacebookFeed extends Block
{
    /**
     * Pinned Graph API version. Update in one place when migrating versions.
     */
    const GRAPH_VERSION = 'v19.0';

    /**
     * AJAX Load More — admin-ajax action + nonce name. Free-side endpoint
     * fired by frontend.js when paginationType === 'ajax'.
     */
    const AJAX_ACTION = 'eb_facebook_feed_load_more';
    const AJAX_NONCE  = 'eb_facebook_feed_load_more';

    protected $attributes = [
        'blockId'          => [ 'type' => 'string' ],
        'layout'           => [ 'type' => 'string', 'default' => 'grid' ],
        'token'            => [ 'type' => 'string', 'default' => '' ],
        'pageId'           => [ 'type' => 'string', 'default' => '' ],
        'sortBy'           => [ 'type' => 'string', 'default' => 'most_recent' ],
        'numberOfPosts'    => [ 'type' => 'number', 'default' => 12 ],
        // Cache TTL in MINUTES. Drives the base value of the
        // essential_blocks/facebook_feed/cache_ttl filter; external listeners
        // can still override (returned value is multiplied to seconds below).
        'cacheTtl'         => [ 'type' => 'number', 'default' => 15 ],
        'thumbs'           => [ 'type' => 'array',  'default' => [] ],
        'showProfileImage' => [ 'type' => 'boolean', 'default' => true ],
        'showPageName'     => [ 'type' => 'boolean', 'default' => true ],
        'showTimestamp'    => [ 'type' => 'boolean', 'default' => true ],
        'showMessage'      => [ 'type' => 'boolean', 'default' => true ],
        'messageLimit'     => [ 'type' => 'number',  'default' => 10 ],
        'showReactions'    => [ 'type' => 'boolean', 'default' => true ],
        'showComments'     => [ 'type' => 'boolean', 'default' => false ],
        'showShares'       => [ 'type' => 'boolean', 'default' => true ],
        'enablePagination' => [ 'type' => 'boolean', 'default' => false ],
        'paginationType'   => [ 'type' => 'string',  'default' => 'ajax' ],
        'postsPerPage'     => [ 'type' => 'number',  'default' => 6 ],
        'loadMoreText'     => [ 'type' => 'string',  'default' => 'Load More' ],
        'enableLink'       => [ 'type' => 'boolean', 'default' => true ],
        'openInNewTab'     => [ 'type' => 'boolean', 'default' => true ],
    ];

    protected $frontend_scripts = [
        'essential-blocks-isotope',
        'essential-blocks-image-loaded',
        'essential-blocks-facebook-feed-frontend',
    ];

    protected static $default_attributes = [
        'blockId'          => '',
        'layout'           => 'grid',
        'token'            => '',
        'pageId'           => '',
        'sortBy'           => 'most_recent',
        'numberOfPosts'    => 12,
        'cacheTtl'         => 15,
        'showProfileImage' => true,
        'showPageName'     => true,
        'showTimestamp'    => true,
        'showMessage'      => true,
        'messageLimit'     => 10,
        'showReactions'    => true,
        'showComments'     => false,
        'showShares'       => true,
        'enablePagination' => false,
        'paginationType'   => 'ajax',
        'enableLink'       => true,
        'openInNewTab'     => true,
        'align'            => '',
    ];

    /**
     * @var Settings
     */
    private $settings;

    public function __construct()
    {
        $this->settings = Settings::get_instance();

        // AJAX Load More — registered for both logged-in and visitor sessions
        // (front-of-site users won't be authenticated).
        add_action( 'wp_ajax_' . self::AJAX_ACTION, [ $this, 'load_more_callback' ] );
        add_action( 'wp_ajax_nopriv_' . self::AJAX_ACTION, [ $this, 'load_more_callback' ] );
    }

    public function get_default_attributes()
    {
        return self::$default_attributes;
    }

    /**
     * Unique block name (kebab-case folder).
     */
    public function get_name()
    {
        return 'facebook-feed';
    }

    /**
     * Register the frontend script (Load More pagination behavior).
     */
    public function register_scripts()
    {
        $this->assets_manager->register(
            'facebook-feed-frontend',
            $this->path() . '/frontend.js'
        );
    }

    /**
     * Render the block on the frontend.
     */
    public function render_callback( $attributes, $content )
    {
        $attributes = wp_parse_args(
            $attributes,
            $this->get_default_attributes()
        );

        // Resolve token — global setting wins; block attribute is a fallback for first save.
        $eb_settings = get_option( 'eb_settings', [] );
        $token       = ! empty( $eb_settings['facebookToken'] )
            ? $eb_settings['facebookToken']
            : ( ! empty( $attributes['token'] ) ? $attributes['token'] : '' );

        // Page ID, like the token, is a global setting (Instagram-style
        // "connect once"). Block attribute remains only as a silent fallback.
        $pageId = ! empty( $eb_settings['facebookPageId'] )
            ? $eb_settings['facebookPageId']
            : ( ! empty( $attributes['pageId'] ) ? $attributes['pageId'] : '' );
        $numberOfPosts = isset( $attributes['numberOfPosts'] ) ? (int) $attributes['numberOfPosts'] : 6;
        $sortBy        = isset( $attributes['sortBy'] ) ? $attributes['sortBy'] : 'most_recent';

        $posts = [];

        if ( ! empty( $token ) && ! empty( $pageId ) ) {
            $posts = $this->fetch_posts( $token, $pageId, $numberOfPosts, $sortBy, $attributes );
            $posts = $this->sort_posts( $posts, $sortBy );
            $posts = array_slice( $posts, 0, $numberOfPosts );
            $posts = apply_filters( 'essential_blocks/facebook_feed/posts', $posts, $attributes );
        }

        do_action( 'essential_blocks/facebook_feed/before_render', $attributes );

        ob_start();
        Helper::views(
            'facebook-feed',
            wp_parse_args(
                $attributes,
                [
                    'block_object' => $this,
                    'classHook'    => isset( $attributes['classHook'] ) ? $attributes['classHook'] : '',
                    'posts'        => $posts,
                    // Pass through the full attributes array so filters in the
                    // view template (e.g. wrapper_data) receive context.
                    'attributes'   => $attributes,
                ]
            )
        );
        $output = ob_get_clean();

        do_action( 'essential_blocks/facebook_feed/after_render', $attributes );

        return $output;
    }

    /**
     * Fetch posts from the Graph API (or the transient cache). Shared by the
     * server-side render and the AJAX Load More endpoint so a warm cache
     * costs zero Graph calls.
     */
    private function fetch_posts( $token, $pageId, $numberOfPosts, $sortBy, $attributes )
    {
        $fields = implode( ',', [
            'id',
            'from{name,id}',
            'message',
            'created_time',
            'permalink_url',
            'full_picture',
            'status_type',
            'attachments{type,media_type,media,subattachments}',
            'reactions.summary(total_count)',
            'comments.summary(total_count)',
            'shares',
        ] );
        $fields = apply_filters( 'essential_blocks/facebook_feed/graph_fields', $fields, $attributes );

        // Graph respects `limit` as a ceiling, not a floor — for small
        // values it commonly returns fewer than requested (pagination
        // cursor quirks, hidden posts, etc.). Request a small buffer
        // above the user's count so the post-fetch slice still has the
        // exact number to trim back to. Capped at Graph's 100/page max.
        $fetch_limit = max( 1, min( 100, $numberOfPosts + 5 ) );

        $query_args = [
            'fields'       => $fields,
            'limit'        => $fetch_limit,
            'access_token' => $token,
        ];
        $query_args = apply_filters( 'essential_blocks/facebook_feed/query_args', $query_args, $attributes );

        $url = sprintf(
            'https://graph.facebook.com/%s/%s/posts?%s',
            self::GRAPH_VERSION,
            rawurlencode( $pageId ),
            http_build_query( $query_args )
        );

        // Key on the actual fetch limit (not numberOfPosts) so a buffer
        // bump invalidates stale transients that were stored under the
        // old key shape.
        $cache_key = 'eb-main-facebook-api_' . md5(
            $token . '|' . $pageId . '|' . $fetch_limit . '|' . $sortBy
        );

        // Base TTL derived from the per-block `cacheTtl` (minutes) attribute,
        // clamped to a sensible minimum so a 0/negative value never short-
        // circuits the cache entirely. Filter listeners still get to override.
        $cache_ttl_minutes = isset( $attributes['cacheTtl'] ) ? (int) $attributes['cacheTtl'] : 15;
        if ( $cache_ttl_minutes < 1 ) {
            $cache_ttl_minutes = 15;
        }
        $cache_ttl = apply_filters(
            'essential_blocks/facebook_feed/cache_ttl',
            $cache_ttl_minutes * MINUTE_IN_SECONDS,
            $attributes
        );

        $results = $this->settings->get_transient( $cache_key );
        if ( ! $results ) {
            $results = HttpRequest::get_instance()->get( $url );
            if ( $results ) {
                $this->settings->set_transient( $cache_key, $results, $cache_ttl );
            }
        }

        $results = apply_filters( 'essential_blocks/facebook_feed/raw_response', $results, $attributes );

        return isset( $results->data ) && is_array( $results->data ) ? $results->data : [];
    }

    /**
     * Newest-first / oldest-first sort. Extracted so the AJAX endpoint can
     * apply the same ordering as the server render.
     */
    private function sort_posts( $posts, $sortBy )
    {
        if ( ! is_array( $posts ) || empty( $posts ) ) {
            return $posts;
        }

        switch ( $sortBy ) {
            case 'least_recent':
                usort(
                    $posts,
                    function ( $a, $b ) {
                        return strtotime( $a->created_time ) <=> strtotime( $b->created_time );
                    }
                );
                break;
            case 'most_recent':
            default:
                usort(
                    $posts,
                    function ( $a, $b ) {
                        return strtotime( $b->created_time ) <=> strtotime( $a->created_time );
                    }
                );
                break;
        }
        return $posts;
    }

    /**
     * AJAX Load More endpoint.
     *
     * Receives the page number + a JSON-encoded subset of the block's
     * display attributes, hits the same transient cache the render uses,
     * applies any Pro `posts` filters, slices to the requested page, and
     * returns rendered post-card HTML.
     */
    public function load_more_callback()
    {
        $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
        if ( ! wp_verify_nonce( $nonce, self::AJAX_NONCE ) ) {
            wp_send_json_error( 'Invalid nonce' );
        }

        $page  = isset( $_POST['page'] ) ? max( 1, (int) $_POST['page'] ) : 1;
        $raw   = isset( $_POST['attrs'] ) ? wp_unslash( $_POST['attrs'] ) : '';
        $attrs = json_decode( $raw, true );

        if ( ! is_array( $attrs ) ) {
            wp_send_json_error( 'Invalid attributes' );
        }

        // Token + Page ID always resolve from global settings — never accept
        // either from the client request (block attribute is a silent fallback).
        $eb_settings = get_option( 'eb_settings', [] );
        $token       = ! empty( $eb_settings['facebookToken'] ) ? $eb_settings['facebookToken'] : '';
        $page_id     = ! empty( $eb_settings['facebookPageId'] )
            ? $eb_settings['facebookPageId']
            : ( isset( $attrs['pageId'] ) ? (string) $attrs['pageId'] : '' );

        if ( empty( $token ) || empty( $page_id ) ) {
            wp_send_json_error( 'Missing token or pageId' );
        }

        $number_of_posts = isset( $attrs['numberOfPosts'] ) ? (int) $attrs['numberOfPosts'] : 6;
        $per_page        = max( 1, isset( $attrs['postsPerPage'] ) ? (int) $attrs['postsPerPage'] : 6 );
        $sort_by         = isset( $attrs['sortBy'] ) ? (string) $attrs['sortBy'] : 'most_recent';

        $posts = $this->fetch_posts( $token, $page_id, $number_of_posts, $sort_by, $attrs );
        $posts = apply_filters( 'essential_blocks/facebook_feed/posts', $posts, $attrs );

        if ( ! is_array( $posts ) || empty( $posts ) ) {
            wp_send_json_success( [
                'html'     => '',
                'has_more' => false,
                'page'     => $page,
            ] );
        }

        $posts = $this->sort_posts( $posts, $sort_by );
        $posts = array_slice( $posts, 0, $number_of_posts );

        $start      = ( $page - 1 ) * $per_page;
        $page_posts = array_slice( $posts, $start, $per_page );
        $has_more   = ( $start + $per_page ) < count( $posts );

        ob_start();
        foreach ( $page_posts as $post ) {
            if ( ! is_object( $post ) ) {
                continue;
            }
            Helper::views(
                'fb-partials/single',
                [
                    'post'             => $post,
                    'target'           => ( ! empty( $attrs['enableLink'] ) && ! empty( $attrs['openInNewTab'] ) ) ? '_blank' : '',
                    'enableLink'       => ! empty( $attrs['enableLink'] ),
                    'showProfileImage' => ! empty( $attrs['showProfileImage'] ),
                    'showPageName'     => ! empty( $attrs['showPageName'] ),
                    'showTimestamp'    => ! empty( $attrs['showTimestamp'] ),
                    'showMessage'      => ! empty( $attrs['showMessage'] ),
                    'messageLimit'     => isset( $attrs['messageLimit'] ) ? (int) $attrs['messageLimit'] : 10,
                    'showReactions'    => ! empty( $attrs['showReactions'] ),
                    'showComments'     => ! empty( $attrs['showComments'] ),
                    'showShares'       => ! empty( $attrs['showShares'] ),
                    'page_number'      => $page,
                    'hidden_attr'      => '',
                ]
            );
        }
        $html = ob_get_clean();

        wp_send_json_success( [
            'html'     => $html,
            'has_more' => $has_more,
            'page'     => $page,
        ] );
    }
}
