package com.comics.activities;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.util.Log;

import com.comics.comic.R;
import com.comics.fragments.ScreenSlidePageCameraFragment;
import com.comics.fragments.ScreenSlidePageFragment;
import com.comics.fragments.ScreenSlidePagePhotoPreviewFragment;

public class ScreenSlidePagerActivity extends FragmentActivity implements ScreenSlidePageFragmentCommunicator {
	/**
	 * The number of pages (wizard steps) to show in this demo.
	 */
	private static final int NUM_PAGES = 5;

	/**
	 * The pager widget, which handles animation and allows swiping horizontally to access previous
	 * and next wizard steps.
	 */
	private ViewPager mPager;

	/**
	 * The pager adapter, which provides the pages to the view pager widget.
	 */
	private PagerAdapter mPagerAdapter;
	private FragmentManager fragmentManager;
	private ScreenSlidePagePhotoPreviewFragment currentScreenSlidePagePhotoPreviewFragment=null; //dirty hack to bypass viewpage's inability to add tags to fragments
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_screen_slide);
		
		// Instantiate a ViewPager and a PagerAdapter.
		fragmentManager=getSupportFragmentManager();
		mPager = (ViewPager) findViewById(R.id.pager);
		mPagerAdapter = new ScreenSlidePagerAdapter(fragmentManager);
		mPager.setAdapter(mPagerAdapter);
	}

	@Override
	public void onBackPressed() {
		if (mPager.getCurrentItem() == 0) {
			// If the user is currently looking at the first step, allow the system to handle the
			// Back button. This calls finish() on this activity and pops the back stack.
			super.onBackPressed();
		} else {
			// Otherwise, select the previous step.
			mPager.setCurrentItem(mPager.getCurrentItem() - 1);
		}
	}

	/**
	 * A simple pager adapter that represents 5 ScreenSlidePageFragment objects, in
	 * sequence.
	 */
	private class ScreenSlidePagerAdapter extends FragmentStatePagerAdapter {
		public ScreenSlidePagerAdapter(FragmentManager fm) {
			super(fm);
		}

		@Override
		public Fragment getItem(int position) {
			switch(position){
			case 0:
				Log.d("Meh","Case 0");
				return new ScreenSlidePageCameraFragment();
			case 1:
				Log.d("Meh","Case 1:"+position);
				currentScreenSlidePagePhotoPreviewFragment = new ScreenSlidePagePhotoPreviewFragment();
				return currentScreenSlidePagePhotoPreviewFragment;
						
			case 2:
				Log.d("Meh","position:"+position);
				return new ScreenSlidePageFragment();
			case 3:
				Log.d("Meh","position:"+position);
				return new ScreenSlidePageFragment();
			case 4:
				Log.d("Meh","position:"+position);
				return new ScreenSlidePageFragment();
			default:
				return null;
			}

		}

		@Override
		public int getCount() {
			return NUM_PAGES;
		}
	}

	@Override
	public void updatePreviewImage(Bitmap b) {
		// Get the bitmap from the camerafragment and put that on the previewfragment
		currentScreenSlidePagePhotoPreviewFragment.receiveOneImage(b);
	}
}