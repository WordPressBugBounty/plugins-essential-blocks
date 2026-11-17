<?php

namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

class Social extends Block
{
    protected $frontend_styles = [];

    /**
     * Unique name of the block.
     *
     * @return string
     */
    public function get_name()
    {
        return 'social';
    }
}
