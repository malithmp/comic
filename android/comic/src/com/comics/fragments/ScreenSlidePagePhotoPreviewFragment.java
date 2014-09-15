package com.comics.fragments; 

import android.graphics.Bitmap;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import com.comics.comic.R;


public class ScreenSlidePagePhotoPreviewFragment extends Fragment{

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,Bundle savedInstanceState) {
		View rootView = inflater.inflate(R.layout.fragment_screen_slide_photo_preview,container, false);
		return rootView;
	}

	@Override
	public void onResume() {
		super.onResume();
	}
	
	public void receiveOneImage(Bitmap b){
		// When the camera takes a picture and the user approves it, it gets sent to the preview page right away
		// This function shows it as an icon
		ImageView image1 = (ImageView)getView().findViewById(R.id.imageView1);
		image1.setImageBitmap(b);
	}
	
}