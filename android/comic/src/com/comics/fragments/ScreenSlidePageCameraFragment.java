package com.comics.fragments;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Camera;
import android.hardware.Camera.PictureCallback;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.RelativeLayout;

import com.comics.activities.ScreenSlidePageFragmentCommunicator;
import com.comics.comic.R;

public class ScreenSlidePageCameraFragment extends Fragment implements OnClickListener{
	ScreenSlidePageFragmentCommunicator communicator;
	Camera camera = null;
	Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
	CameraPreview cameraPreview = null;
	
	Bitmap oneimage=null; //TODO remove this and add an array of size 4 to hold the images

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,Bundle savedInstanceState) {
		ViewGroup rootView = (ViewGroup) inflater.inflate(R.layout.fragment_screen_slide_page_camera, container, false);
		// Declare all buttons on the camera screen
		Button cross = (Button) rootView.findViewById(R.id.button_cross);
		ImageButton tick = (ImageButton) rootView.findViewById(R.id.button_tick);
		ImageButton nextPhoto =  (ImageButton) rootView.findViewById(R.id.button_next_photo);		
		Button takePicture = (Button) rootView.findViewById(R.id.button_capture);
		
		// Set on click listeners for the buttons dynamically
		takePicture.setOnClickListener(this);
		cross.setOnClickListener(this);
		tick.setOnClickListener(this);
		nextPhoto.setOnClickListener(this);
		
		// Make cross, tick and nextPhoto buttons invisible
		cross.setVisibility(View.INVISIBLE);
		tick.setVisibility(View.INVISIBLE);
		nextPhoto.setVisibility(View.INVISIBLE);


		// Initialize the camera
		camera = getCameraInstance();
		camera.setDisplayOrientation(90);

		// Create our Preview view and set it as the content of our activity.
		cameraPreview = new CameraPreview(getActivity().getApplicationContext(), camera);
		RelativeLayout preview = (RelativeLayout) rootView.findViewById(R.id.camera_preview);
		preview.addView(cameraPreview);

		return rootView;
	}

	@Override
	public void onAttach(Activity activity) {
		communicator=(ScreenSlidePageFragmentCommunicator)activity;
		super.onAttach(activity);
	}
	
	/*
	 * 
	 * EVERYTHING RELATED TO THE CAMERA
	 * 
	 * */
	

	/** A safe way to get an instance of the Camera object. */
	public static Camera getCameraInstance(){
		Camera c = null;
		try {
			c = Camera.open(); // attempt to get a Camera instance
			System.out.println("Getting camera instance. Opening camera......");
		}
		catch (Exception e){
			// Camera is not available (in use or does not exist)
			System.out.println("Camera is not available");
			e.printStackTrace();
		}
		return c; // returns null if camera is unavailable
	}

	/** A basic Camera preview class */
	private static final String TAG = "CameraActivity";

	public class CameraPreview extends SurfaceView implements SurfaceHolder.Callback {
		private SurfaceHolder mHolder;
		private Camera mCamera;

		public CameraPreview(Context context, Camera camera) {
			super(context);
			mCamera = camera;

			// Install a SurfaceHolder.Callback so we get notified when the
			// underlying surface is created and destroyed.
			mHolder = getHolder();
			mHolder.addCallback(this);
			// deprecated setting, but required on Android versions prior to 3.0
			if(Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB)
				mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
		}

		public void surfaceCreated(SurfaceHolder holder) {
			// The Surface has been created, now tell the camera where to draw the preview.
			try {
				mCamera.setPreviewDisplay(holder);
				mCamera.startPreview();
				System.out.println("Surface has been created");
			} catch (IOException e) {
				Log.d(TAG, "Error setting camera preview: " + e.getMessage());
			}
		}

		public void surfaceDestroyed(SurfaceHolder holder) {
			// empty. Take care of releasing the Camera preview in your activity.
			// if(camera!=null){
			releaseCamera();
			System.out.println("Surface has been destroyed");
			//camera.release();
			//camera = null;
			// }
		}

		public void surfaceChanged(SurfaceHolder holder, int format, int w, int h) {
			// If your preview can change or rotate, take care of those events here.
			// Make sure to stop the preview before resizing or reformatting it.

			System.out.println("BLAH Surface has been changed");
			if (mHolder.getSurface() == null){
				// preview surface does not exist
				return;
			}

			// stop preview before making changes
			try {
				mCamera.stopPreview();
			} catch (Exception e){
				// ignore: tried to stop a non-existent preview
			}

			// set preview size and make any resize, rotate or
			// reformatting changes here

			// start preview with new settings
			try {
				mCamera.setPreviewDisplay(mHolder);
				mCamera.startPreview();

			} catch (Exception e){
				Log.d(TAG, "Error starting camera preview: " + e.getMessage());
			}
		}
	}

	public static final int MEDIA_TYPE_IMAGE = 1;
	public static final int MEDIA_TYPE_VIDEO = 2;

	private PictureCallback picture = new PictureCallback() {

		@Override
		public void onPictureTaken(byte[] data, Camera camera)
		{
			// First convert the byte stream to a bitmap

			ByteArrayInputStream inputStream = new ByteArrayInputStream(data);
			Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
			oneimage = Bitmap.createScaledBitmap(bitmap, 300, 300, false);
			
			communicator.updatePreviewImage(oneimage); // this will call the activities updateImages
			//ImageView picture = new ImageView(this);
			//picture.setImageBitmap(bitmap);
			Log.d("Meh","DONE CAPTURING ");
			
			// TODO Implement an algorithm to use internal storage instead of external storage
			FileOutputStream outputStream;
			String filename = "myfile";
			try {
				// TODO Save image here, and use Malith's function to scale it down
				/*
				ByteArrayInputStream inputStream = new ByteArrayInputStream(data);
				Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
				oneimage = Bitmap.createScaledBitmap(bitmap, 300, 300, false);
				*/

			} catch (Exception e) {
				System.out.println("Failed to create file");
				e.printStackTrace();
			}
			}

	};
	
	// Add a listener to the camera flip button
	// TODO Doesn't work
	public void flipCamera(View view)
	{
		int numberOfCameras = camera.getNumberOfCameras();
		int frontCamID = -1;
		int backCamID = -1;
		// Let's determine IDs of front and back camera, fuck the rest
		for(int i = 0; i < numberOfCameras; i++)
		{
			camera.getCameraInfo(i , cameraInfo);
			if(cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT)
			{
				frontCamID = i;
			}
			if(cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_BACK)
			{
				backCamID = i;
			}
		}
		// Now let's flip
		if(cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT && backCamID != -1)
		{
			releaseCamera();
			camera = Camera.open(backCamID);
			System.out.println("Flipping to back camera");
		}
		else if(cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_BACK && frontCamID != -1)
		{
			releaseCamera();
			camera = Camera.open(frontCamID);
			System.out.println("Flipping to front camera");
		}
		else
		{
			System.out.println("Camera IDs not initialized");
		}
	}
	
	// Add a listener to the Capture button
	public void capturePicture(View view) {
		// Make capture and flip camera button disappear
		Button button = (Button) view;
		ImageButton flipCamera = (ImageButton) getView().findViewById(R.id.button_camera_flip);
		button.setVisibility(View.INVISIBLE);
		flipCamera.setVisibility(View.INVISIBLE);
		// Make tick and cross button appear
		Button cross = (Button) getView().findViewById(R.id.button_cross);
		ImageButton tick = (ImageButton) getView().findViewById(R.id.button_tick);
		ImageButton nextPhoto =  (ImageButton) getView().findViewById(R.id.button_next_photo);

		cross.setVisibility(View.VISIBLE);
		tick.setVisibility(View.VISIBLE);
		nextPhoto.setVisibility(View.VISIBLE);
		// TODO get an image from the camera and save it
		camera.takePicture(null, null, picture);
	}

	// Add a listener to the tick button
	public void donePicture(View view) {
		// TODO Switch to the view which shows you a max of 4 photos in a pallete
		Log.d("meh","donePicture");
		// Reload the camera preview and sends the current photo to Malith
		// Create our Preview view and set it as the content of our activity.
		View rootView = getView();
		// Declare all buttons on the camera screen
		Button cross = (Button) rootView.findViewById(R.id.button_cross);
		ImageButton tick = (ImageButton) rootView.findViewById(R.id.button_tick);
		ImageButton nextPhoto =  (ImageButton) rootView.findViewById(R.id.button_next_photo);		
		Button takePicture = (Button) rootView.findViewById(R.id.button_capture);
		// Make cross, tick and nextPhoto buttons invisible
		cross.setVisibility(View.INVISIBLE);
		tick.setVisibility(View.INVISIBLE);
		nextPhoto.setVisibility(View.INVISIBLE);
		takePicture.setVisibility(View.VISIBLE);
		camera.startPreview();

	}
	// Add a listener to the cross button
	public void cancelPicture(View view) {
		// TODO Deletes the current photo and goes back to camera preview
		Log.d("meh","cancelPicture");
		// Reload the camera preview and sends the current photo to Malith
		// Create our Preview view and set it as the content of our activity.
		View rootView = getView();
		// Declare all buttons on the camera screen
		Button cross = (Button) rootView.findViewById(R.id.button_cross);
		ImageButton tick = (ImageButton) rootView.findViewById(R.id.button_tick);
		ImageButton nextPhoto =  (ImageButton) rootView.findViewById(R.id.button_next_photo);		
		Button takePicture = (Button) rootView.findViewById(R.id.button_capture);
		// Make cross, tick and nextPhoto buttons invisible
		cross.setVisibility(View.INVISIBLE);
		tick.setVisibility(View.INVISIBLE);
		nextPhoto.setVisibility(View.INVISIBLE);
		takePicture.setVisibility(View.VISIBLE);
		camera.startPreview();

	}
	
	// Add a listener to the Next Photo button
	public void nextPhoto(View view)
	{
		Log.d("meh","nextPhoto");
		// Reload the camera preview and sends the current photo to Malith
		// Create our Preview view and set it as the content of our activity.
		View rootView = getView();
		// Declare all buttons on the camera screen
		Button cross = (Button) rootView.findViewById(R.id.button_cross);
		ImageButton tick = (ImageButton) rootView.findViewById(R.id.button_tick);
		ImageButton nextPhoto =  (ImageButton) rootView.findViewById(R.id.button_next_photo);		
		Button takePicture = (Button) rootView.findViewById(R.id.button_capture);
		// Make cross, tick and nextPhoto buttons invisible
		cross.setVisibility(View.INVISIBLE);
		tick.setVisibility(View.INVISIBLE);
		nextPhoto.setVisibility(View.INVISIBLE);
		takePicture.setVisibility(View.VISIBLE);
		// Initialize the camera again			
		camera.startPreview();
	}
	// Add a listener to the Show Picture button
	public void showPicture(View view) {
		// TODO Probably don't need this, remove it
	}

	@Override
	public void onPause() {
		super.onPause();
		releaseCamera(); // release the camera immediately on pause event
	}


	private void releaseCamera(){
		if (camera != null){
			camera.stopPreview();
			camera.setPreviewCallback(null);
			try
			{
				cameraPreview.getHolder().removeCallback(cameraPreview);
			}
			catch (Exception e)
			{
				Log.d(TAG, "Error removing callback from camera preview: " + e.getMessage());
			}
			camera.release();        // release the camera for other applications
			System.out.println("Camera Released");
			camera = null;
		}
	}

	@Override
	public void onClick(View v) {
		switch(v.getId()){
		case R.id.button_capture:
			capturePicture(v);
			break;
		case R.id.button_next_photo:
			nextPhoto(v);
			break;
		case R.id.button_tick:
			donePicture(v);
			break;
		case R.id.button_cross:
			Log.d("meh","Button Cross!");
			cancelPicture(v);
			break;
		default:
			break;
		}

	}
	
	/*

    @Override
    protected void onResume()
    {
        super.onResume();
        System.out.println("Resuming app");
        try
        {
            camera = getCameraInstance();
            cameraPreview = new CameraPreview(this.getApplication(), camera);//set preview
            RelativeLayout preview = (RelativeLayout) findViewById(R.id.camera_preview);
            preview.addView(cameraPreview);
        } catch (Exception e){
            Log.d(TAG, "Error starting camera preview: " + e.getMessage());
        }
    }
	 */

	
	// TODO POTENTIALLY CRAP

	/** Create a File for saving an image or video */
	private static File getOutputMediaFile(int type){
		// To be safe, you should check that the SDCard is mounted
		// using Environment.getExternalStorageState() before doing this.

		File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(
				Environment.DIRECTORY_PICTURES), "comixtripCamera");
		// This location works best if you want the created images to be shared
		// between applications and persist after your app has been uninstalled.

		// Create the storage directory if it does not exist
		if (! mediaStorageDir.exists()){
			if (! mediaStorageDir.mkdirs()){
				Log.d("comixtripCamera", "failed to create directory");
				return null;
			}
		}

		// Create a media file name
		String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
		File mediaFile;
		if (type == MEDIA_TYPE_IMAGE){
			mediaFile = new File(mediaStorageDir.getPath() + File.separator +
					"IMG_"+ timeStamp + ".jpg");
		} else if(type == MEDIA_TYPE_VIDEO) {
			mediaFile = new File(mediaStorageDir.getPath() + File.separator +
					"VID_"+ timeStamp + ".mp4");
		} else {
			return null;
		}

		return mediaFile;
	}
	
	
}
