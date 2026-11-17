<?php

namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

class TeamMember extends Block
{
    protected $frontend_styles = [];

    /**
     * Unique name of the block.
     *
     * @return string
     */
    public function get_name()
    {
        return 'team-member';
    }
}
